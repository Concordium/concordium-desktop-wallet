/* eslint-disable no-console */
import { replace } from 'connected-react-router';
import React, {
    Fragment,
    ReactNode,
    useCallback,
    useEffect,
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

import multisigFlowStyles from '../common/MultiSignatureFlowPage.module.scss';

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
    [K in keyof F]: FlowChild<F, K>;
};

interface AccountStep {
    account: Account;
}

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
    const [chosen, setChosen] = useState<Account | undefined>(initial);

    const extendedFilter: typeof filter = useCallback(
        (a, i) => isMultiSig(a) && filter(a, i),
        [filter]
    );

    console.log(extendedFilter);

    useEffect(() => {
        if (chosen) {
            onNext(chosen);
        }
    }, [chosen, onNext]);

    return (
        <PickAccount
            setAccount={setChosen}
            chosenAccount={chosen}
            // filter={extendedFilter}
            messageWhenEmpty="No elligable accounts requiring multiple signatures"
            isDisabled={disabled}
        />
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
    convert(values: AccountStep & F): T;
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
    type WithAccount = AccountStep & F;

    const { pathname, state } = useLocation<WithAccount | null>();
    const valueStore = useState<Partial<WithAccount>>(state ?? {});
    const [values] = valueStore;
    const dispatch = useDispatch();

    const flowChildren = useMemo(
        () => (typeof children === 'function' ? children(values) : children),
        [children, values]
    );

    const keyViewPairs: [
        keyof F,
        FlowChild<F, keyof F>['view']
    ][] = useMemo(
        () =>
            Object.entries(
                flowChildren
            ).map(([k, c]: [keyof F, FlowChild<F, keyof F>]) => [k, c.view]),
        [flowChildren]
    );

    const getStepTitle = useCallback(
        (step?: keyof WithAccount | 'sign') => {
            if (step === 'sign') {
                return SIGN_STEP_TITLE;
            }

            if (step === 'account') {
                return ACCOUNT_STEP_TITLE;
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

    const handleDone = (v: WithAccount) => {
        const transaction = convert(v);
        const serialized = stringify(transaction);

        dispatch(replace(pathname, v));

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
                    </div>
                </Columns.Column>
                <Columns.Column
                    header={stepTitle}
                    className={multisigFlowStyles.stretchColumn}
                >
                    <div className={multisigFlowStyles.columnContent}>
                        <div className="flexFill">
                            <MultiStepForm<WithAccount>
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
