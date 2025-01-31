/* eslint-disable react/display-name */
import React, { ReactNode, useCallback, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
    Redirect,
    Route,
    Switch,
    useLocation,
    useRouteMatch,
} from 'react-router';
import { push } from 'connected-react-router';
import { Account, AccountInfo, AccountTransaction } from '~/utils/types';
import MultiStepForm, {
    FormChild,
    FormChildren,
    MultiStepFormPageProps,
    MultiStepFormProps,
    OrRenderValues,
} from '~/components/MultiStepForm';
import MultiSignatureLayout from '../MultiSignatureLayout';
import Columns from '~/components/Columns';
import PickAccount from '~/components/PickAccount';
import { isMultiSig } from '~/utils/accountHelpers';
import { AccountDetail } from './proposal-details/shared';
import Form from '~/components/Form';
import DisplayTransactionExpiryTime from '~/components/DisplayTransactionExpiryTime';
import Loading from '~/cross-app-components/Loading';
import { getDefaultExpiry } from '~/utils/timeHelpers';
import SignTransaction from './SignTransaction';
import { useAsyncMemo } from '~/utils/hooks';
import { getNextAccountNonce } from '~/node/nodeRequests';
import errorMessages from '~/constants/errorMessages.json';
import routes from '~/constants/routes.json';
import SimpleErrorModal from '~/components/SimpleErrorModal';

import multisigFlowStyles from '../common/MultiSignatureFlowPage.module.scss';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface FlowChild<F, K extends keyof F = any> extends FormChild<F, K> {
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

export type RequiredValues = AccountStep & ExpiryStep;

type SelectAccountPageProps = Omit<
    MultiStepFormPageProps<Account>,
    'formValues'
> & {
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

    return (
        <PickAccount
            chosenAccount={initial}
            onAccountClicked={(a) => onNext(a)}
            filter={extendedFilter}
            messageWhenEmpty="No eligible accounts requiring multiple signatures"
            isDisabled={disabled}
        />
    );
};

type SelectExpiryPageProps = Omit<MultiStepFormPageProps<Date>, 'formValues'>;

const SelectExpiryPage = ({
    onNext,
    initial = getDefaultExpiry(),
}: SelectExpiryPageProps) => {
    return (
        <Form<ExpiryStep>
            onSubmit={(v) => onNext(v.expiry)}
            className="flexColumn flexChildFill"
        >
            <div className="flexChildFill">
                <p>Choose the expiry date for the transaction.</p>
                <p>
                    Committing the transaction after this date, will result in
                    the transaction being rejected.
                </p>
                <Form.DatePicker
                    className="body2 mV40"
                    label="Transaction expiry time"
                    name="expiry"
                    defaultValue={initial}
                    minDate={new Date()}
                />
            </div>
            <Form.Submit>Continue</Form.Submit>
        </Form>
    );
};

interface Props<F extends Record<string, unknown>, T extends AccountTransaction>
    extends Omit<
        MultiStepFormProps<RequiredValues & F>,
        'onDone' | 'initialValues' | 'valueStore'
    > {
    /**
     * Flow title.
     */
    title: string;
    /**
     * Function to filter eligible accounts for transaction.
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
    convert(values: RequiredValues & F, nonce: bigint): T;
    /**
     * Component to render preview of transaction values.
     */
    preview(values: Partial<RequiredValues & F>): JSX.Element;
    /**
     * Pages of the transaction flow declared as a mapping of components to corresponding substate.
     * Declaration order defines the order the pages are shown.
     */
    children: OrRenderValues<
        RequiredValues & F,
        FlowChildren<RequiredValues & F>
    >;
}

interface InternalState {
    stepTitle: string;
}

const ACCOUNT_STEP_TITLE = 'Select account';
const EXPIRY_STEP_TITLE = 'Select transaction expiry';
const SIGN_STEP_TITLE = 'Signature and hardware wallet';

/**
 * A component for composing flows for multi-signature account transactions.
 *
 * @template F Type of the form as a whole. Each step in the form flow should correspond to a member on the type.
 * @template T Type of the transaction produced by the flow.
 */
export default function MultiSigAccountTransactionFlow<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    F extends Record<string, any>,
    T extends AccountTransaction
>({
    title,
    convert,
    children,
    accountFilter,
    preview,
    accountDisabled,
    ...formProps
}: Props<F, T>) {
    type WithMultiSigSteps = RequiredValues & F;

    const { path: matchedPath } = useRouteMatch();
    const {
        state,
        pathname: currentPath,
    } = useLocation<WithMultiSigSteps | null>();
    const signPath = useMemo(() => `${matchedPath}/sign`, [matchedPath]);
    const valueStore = useState<Partial<WithMultiSigSteps>>(state ?? {});
    const [values] = valueStore;
    const [showError, setShowError] = useState(false);
    const [transaction, setTransaction] = useState<T>();
    const dispatch = useDispatch();

    const nonce = useAsyncMemo(
        async () => {
            if (values.account === undefined) {
                return undefined;
            }
            const { value: n } = await getNextAccountNonce(
                values.account?.address
            );
            return n;
        },
        () => setShowError(true),
        [values.account]
    );

    const flowChildren = useMemo(
        () => (typeof children === 'function' ? children(values) : children),
        [children, values]
    );

    const handleDone = useCallback(
        (v: WithMultiSigSteps) => {
            if (!nonce) {
                throw new Error('Tried to create transaction with no nonce');
            }

            const t = convert(v, nonce);
            setTransaction(t);

            dispatch(push(signPath));
        },
        [convert, nonce, dispatch, signPath]
    );

    const getStepTitle = useCallback(
        (step?: keyof WithMultiSigSteps) => {
            if (step === 'account') {
                return ACCOUNT_STEP_TITLE;
            }

            if (step === 'expiry') {
                return EXPIRY_STEP_TITLE;
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

    const onPageActive = (step: keyof WithMultiSigSteps) => {
        setState({ stepTitle: getStepTitle(step) });
    };

    const columnTitle = currentPath === signPath ? SIGN_STEP_TITLE : stepTitle;

    return (
        <MultiSignatureLayout
            pageTitle={`Account transaction | ${title}`}
            delegateScroll
        >
            <SimpleErrorModal
                show={showError}
                header={errorMessages.unableToReachNode}
                onClick={() => dispatch(routes.MULTISIGTRANSACTIONS)}
            />
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
                        {preview(values)}
                        <DisplayTransactionExpiryTime
                            expiryTime={values.expiry}
                            placeholder="To be determined"
                        />
                    </div>
                </Columns.Column>
                <Columns.Column
                    header={columnTitle}
                    className={multisigFlowStyles.stretchColumn}
                >
                    <Switch>
                        <Route path={`${matchedPath}/sign`}>
                            {transaction !== undefined ? (
                                <SignTransaction
                                    account={values.account}
                                    transaction={transaction}
                                />
                            ) : (
                                <Redirect to={matchedPath} />
                            )}
                        </Route>
                        <Route path={matchedPath}>
                            <div className={multisigFlowStyles.columnContent}>
                                <MultiStepForm<WithMultiSigSteps>
                                    initialValues={state ?? undefined}
                                    valueStore={valueStore}
                                    onPageActive={onPageActive}
                                    onDone={handleDone}
                                    {...formProps}
                                >
                                    {
                                        {
                                            account: state?.account
                                                ? undefined
                                                : {
                                                      render: (
                                                          initial,
                                                          onNext
                                                      ) => (
                                                          <SelectAccountPage
                                                              filter={
                                                                  accountFilter
                                                              }
                                                              disabled={
                                                                  accountDisabled
                                                              }
                                                              initial={initial}
                                                              onNext={onNext}
                                                          />
                                                      ),
                                                  },
                                            ...(flowChildren as FormChildren<F>),
                                            expiry: {
                                                render: (initial, onNext) => (
                                                    <SelectExpiryPage
                                                        initial={initial}
                                                        onNext={onNext}
                                                    />
                                                ),
                                            },
                                        } as FormChildren<WithMultiSigSteps>
                                    }
                                </MultiStepForm>
                            </div>
                        </Route>
                    </Switch>
                </Columns.Column>
            </Columns>
        </MultiSignatureLayout>
    );
}

export const MultiSigAccountTransactionFlowLoading = ({
    title,
}: {
    title: string;
}) => (
    <MultiSignatureLayout pageTitle={title}>
        <Loading text="Loading transaction dependencies" />
    </MultiSignatureLayout>
);
