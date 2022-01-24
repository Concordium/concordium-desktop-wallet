import { replace } from 'connected-react-router';
import React, {
    Fragment,
    ReactNode,
    useCallback,
    useMemo,
    useState,
} from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router';
import { stringify } from '~/utils/JSONHelper';
import { Account, AccountInfo, AccountTransaction } from '~/utils/types';
import MultiStepForm, {
    FormChild,
    MultiStepFormPageProps,
    MultiStepFormProps,
    OrRenderValues,
} from '~/components/MultiStepForm';
import MultiSignatureLayout from '../MultiSignatureLayout';
import Columns from '~/components/Columns';
import SignTransactionProposal from '../SignTransactionProposal';
import PickAccount from '~/components/PickAccount';
import { isMultiSig } from '~/utils/accountHelpers';
import { partialApply } from '~/utils/componentHelpers';
import { AccountDetail } from './proposal-details/shared';
import Form from '~/components/Form';
import DisplayTransactionExpiryTime from '~/components/DisplayTransactionExpiryTime';

import multisigFlowStyles from '../common/MultiSignatureFlowPage.module.scss';
import { isDefined } from '~/utils/basicHelpers';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface FlowChild<F, K extends keyof F = any> extends FormChild<F, K> {
    /**
     * Function rendering current value of the substate represented by the flow child in the left column.
     */
    view(v: F[K] | undefined): JSX.Element;
    /**
     * Page title.
     */
    title: string;
}

type FlowChildren<F extends Record<string, unknown>> = {
    [K in keyof F]?: FlowChild<F, K>;
};

interface AccountStep {
    account: Account;
}

interface ExpiryStep {
    expiry: Date;
}

interface SignStep {
    sign: undefined;
}

type MultiSigAccountTransactionSteps = AccountStep & ExpiryStep & SignStep;

type SelectAccountPageProps = MultiStepFormPageProps<Account> & {
    filter?(account: Account, info?: AccountInfo): boolean;
    disabled?(account: Account, info?: AccountInfo): ReactNode | undefined;
};

const SelectAccountPage = ({
    onNext,
    initial,
    filter = () => true,
    disabled = () => undefined,
}: SelectAccountPageProps) => {
    const extendedFilter: typeof filter = useCallback(
        (a, i) => isMultiSig(a) && filter(a, i),
        [filter]
    );

    // eslint-disable-next-line no-console
    console.log(extendedFilter);

    return (
        <PickAccount
            chosenAccount={initial}
            onAccountClicked={(a) => onNext(a)}
            // filter={extendedFilter}
            messageWhenEmpty="No elligable accounts requiring multiple signatures"
            isDisabled={disabled}
        />
    );
};

type SelectExpiryPageProps = MultiStepFormPageProps<Date>;

const SelectExpiryPage = ({ onNext, initial }: SelectExpiryPageProps) => {
    return (
        <Form<ExpiryStep> onSubmit={(v) => onNext(v.expiry)}>
            <Form.DatePicker
                className="body2 mV40"
                label="Transaction expiry time"
                name="expiry"
                defaultValue={initial}
                minDate={new Date()}
            />
            <p>Choose the expiry date for the transaction.</p>
            <p>Committing the transaction after this date, will be rejected.</p>
        </Form>
    );
};

interface Props<F extends Record<string, unknown>, T extends AccountTransaction>
    extends Omit<
        MultiStepFormProps<F>,
        'onDone' | 'initialValues' | 'valueStore'
    > {
    /**
     * Flow title.
     */
    title: string;
    /**
     * Function to filter elligable accounts for transaction.
     */
    accountFilter?(account: Account, info?: AccountInfo): boolean;
    /**
     * Function to disable accounts for selection.
     */
    accountDisabled?(
        account: Account,
        info?: AccountInfo
    ): ReactNode | undefined;
    /**
     * Function to convert flow values into an account transaction.
     */
    convert(
        values: Omit<MultiSigAccountTransactionSteps, keyof SignStep> & F
    ): T;
    /**
     * Pages of the transaction flow declared as a mapping of components to corresponding substate.
     * Declaration order defines the order the pages are shown.
     */
    children: OrRenderValues<F, FlowChildren<F>>;
}

interface InternalState {
    stepTitle: string;
}

const ACCOUNT_STEP_TITLE = 'Select account';
const EXPIRY_STEP_TITLE = 'Select transaction expiry';
const SIGN_STEP_TITLE = 'Signature and hardware wallet';

export default function MultiSigAccountTransactionFlow<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    F extends Record<string, any>,
    T extends AccountTransaction
>({
    title,
    convert,
    children,
    accountFilter,
    accountDisabled,
    ...formProps
}: Props<F, T>) {
    type WithMultiSigSteps = MultiSigAccountTransactionSteps & F;

    const { pathname, state } = useLocation<WithMultiSigSteps | null>();
    const valueStore = useState<Partial<WithMultiSigSteps>>(state ?? {});
    const [values] = valueStore;
    const dispatch = useDispatch();

    const flowChildren = useMemo(
        () => (typeof children === 'function' ? children(values) : children),
        [children, values]
    );

    const keyViewPairs: [keyof F, FlowChild<F, keyof F>['view']][] = useMemo(
        () =>
            Object.entries(flowChildren)
                .filter(([, c]) => isDefined(c))
                .map(([k, c]: [keyof F, FlowChild<F, keyof F>]) => [k, c.view]),
        [flowChildren]
    );

    const getStepTitle = useCallback(
        (step?: keyof WithMultiSigSteps) => {
            if (step === 'account') {
                return ACCOUNT_STEP_TITLE;
            }

            if (step === 'expiry') {
                return EXPIRY_STEP_TITLE;
            }

            if (step === 'sign') {
                return SIGN_STEP_TITLE;
            }

            const activeChild = step
                ? flowChildren[step]
                : Object.values(flowChildren)[0];

            return activeChild.title;
        },
        [flowChildren]
    );

    const [{ stepTitle }, setState] = useState<InternalState>({
        stepTitle: getStepTitle(),
    });

    const onPageActive = (step: keyof F) => {
        setState({ stepTitle: getStepTitle(step) });
    };

    const handleDone = (v: WithMultiSigSteps) => {
        const transaction = convert(v);
        const serialized = stringify(transaction);

        dispatch(replace(pathname, v));

        // eslint-disable-next-line no-console
        console.log(transaction, serialized);
    };

    return (
        <MultiSignatureLayout pageTitle={title} delegateScroll>
            <Columns
                divider
                columnScroll
                className={multisigFlowStyles.subtractContainerPadding}
            >
                <Columns.Column header="Transaction details">
                    <div className={multisigFlowStyles.columnContent}>
                        <AccountDetail
                            title="Account"
                            first
                            value={values.account}
                        />
                        {keyViewPairs.map(([key, view]) => (
                            <Fragment key={key as string}>
                                {view(values[key])}
                            </Fragment>
                        ))}
                        <DisplayTransactionExpiryTime
                            expiryTime={values.expiry}
                            placeholder="To be determined"
                        />
                    </div>
                </Columns.Column>
                <Columns.Column
                    header={stepTitle}
                    className={multisigFlowStyles.stretchColumn}
                >
                    <div className={multisigFlowStyles.columnContent}>
                        <div className="flexFill">
                            <MultiStepForm<WithMultiSigSteps>
                                initialValues={state ?? undefined}
                                valueStore={valueStore}
                                onDone={handleDone}
                                onPageActive={onPageActive}
                                {...formProps}
                            >
                                {{
                                    account: {
                                        component: partialApply(
                                            SelectAccountPage,
                                            {
                                                filter: accountFilter,
                                                disabled: accountDisabled,
                                            }
                                        ),
                                    },
                                    ...flowChildren,
                                    expiry: { component: SelectExpiryPage },
                                    sign: {
                                        component: SignTransactionProposal,
                                    },
                                }}
                            </MultiStepForm>
                        </div>
                    </div>
                </Columns.Column>
            </Columns>
        </MultiSignatureLayout>
    );
}
