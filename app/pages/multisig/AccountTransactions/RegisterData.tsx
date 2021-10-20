import React, { useState, useCallback, FormEvent } from 'react';
import { useDispatch } from 'react-redux';
import { Route, Switch, useRouteMatch, useLocation } from 'react-router';
import { push } from 'connected-react-router';
import MultiSignatureLayout from '../MultiSignatureLayout/MultiSignatureLayout';
import Columns from '~/components/Columns';
import Button from '~/cross-app-components/Button';
import {
    Account,
    TransactionKindId,
    RegisterData,
    Fraction,
} from '~/utils/types';
import PickAccount from '~/components/PickAccount';
import SimpleErrorModal from '~/components/SimpleErrorModal';
import {
    createRegisterDataTransaction,
    validateData,
} from '~/utils/transactionHelpers';
import routes from '~/constants/routes.json';
import { useTransactionCostEstimate } from '~/utils/dataHooks';
import SignTransaction from './SignTransaction';
import RegisterDataProposalDetails from './proposal-details/RegisterDataProposalDetails';
import { ensureExchangeRate } from '~/components/Transfers/withExchangeRate';
import { getNextAccountNonce } from '~/node/nodeRequests';
import LoadingComponent from './LoadingComponent';
import {
    BakerSubRoutes,
    getLocationAfterAccounts,
} from '~/utils/accountRouterHelpers';
import ChooseExpiry from './ChooseExpiry';
import ErrorMessage from '~/components/Form/ErrorMessage';
import TextArea from '~/components/Form/TextArea';
import errorMessages from '~/constants/errorMessages.json';

import styles from './MultisignatureAccountTransactions.module.scss';

interface PageProps {
    exchangeRate: Fraction;
}

interface State {
    account?: Account;
}

function RegisterData({ exchangeRate }: PageProps) {
    const dispatch = useDispatch();

    const { state } = useLocation<State>();

    const { path, url } = useRouteMatch();
    const [account, setAccount] = useState<Account | undefined>(state?.account);
    const [data, setData] = useState<string>();
    const [error, setError] = useState<string>();
    const [transaction, setTransaction] = useState<RegisterData>();

    const estimatedFee = useTransactionCostEstimate(
        TransactionKindId.Register_data,
        exchangeRate,
        account?.signatureThreshold,
        undefined,
        data?.length ? 2 + data.length : 0
    );

    const [expiryTime, setExpiryTime] = useState<Date>();

    const onCreateTransaction = async () => {
        if (account === undefined) {
            setError('Account is needed to make transaction');
            return;
        }

        if (data === undefined) {
            setError('The data is needed to make transaction');
            return;
        }

        const accountNonce = await getNextAccountNonce(account.address);
        setTransaction(
            createRegisterDataTransaction(
                account.address,
                accountNonce.nonce,
                data,
                account?.signatureThreshold,
                expiryTime
            )
        );
    };

    return (
        <MultiSignatureLayout
            pageTitle="Multi Signature Transactions | Register Data"
            stepTitle="Transaction Proposal - Register Data"
            delegateScroll
        >
            <SimpleErrorModal
                show={Boolean(error)}
                header="Unable to perform transfer"
                content={error}
                onClick={() => dispatch(push(routes.MULTISIGTRANSACTIONS))}
            />
            <Columns divider columnScroll>
                <Columns.Column
                    header="Transaction Details"
                    className={styles.stretchColumn}
                >
                    <div className={styles.columnContent}>
                        <RegisterDataProposalDetails
                            account={account}
                            estimatedFee={estimatedFee}
                            data={data}
                            expiryTime={expiryTime}
                        />
                    </div>
                </Columns.Column>
                <Switch>
                    <Route exact path={path}>
                        <Columns.Column
                            header="Accounts"
                            className={styles.stretchColumn}
                        >
                            <div className={styles.columnContent}>
                                <div className="flexChildFill">
                                    <PickAccount
                                        setAccount={setAccount}
                                        chosenAccount={account}
                                        messageWhenEmpty="There are no accounts "
                                        onAccountClicked={() => {
                                            dispatch(
                                                push(
                                                    getLocationAfterAccounts(
                                                        url,
                                                        TransactionKindId.Register_data
                                                    )
                                                )
                                            );
                                        }}
                                    />
                                </div>
                            </div>
                        </Columns.Column>
                    </Route>
                    <Route path={`${path}/${BakerSubRoutes.data}`}>
                        <Columns.Column
                            header="Data to register"
                            className={styles.stretchColumn}
                        >
                            <div className={styles.columnContent}>
                                <div className="flexChildFill">
                                    <EnterData setData={setData} data={data} />
                                </div>
                                <Button
                                    className="mT40"
                                    disabled={data === undefined}
                                    onClick={() => {
                                        dispatch(
                                            push(
                                                `${url}/${BakerSubRoutes.expiry}`
                                            )
                                        );
                                    }}
                                >
                                    Continue
                                </Button>
                            </div>
                        </Columns.Column>
                    </Route>

                    <Route path={`${path}/${BakerSubRoutes.expiry}`}>
                        <Columns.Column
                            header="Transaction expiry time"
                            className={styles.stretchColumn}
                        >
                            <ChooseExpiry
                                buttonText="Continue"
                                onClick={(expiry: Date) => {
                                    setExpiryTime(expiry);
                                    onCreateTransaction()
                                        .then(() =>
                                            dispatch(
                                                push(
                                                    `${url}/${BakerSubRoutes.sign}`
                                                )
                                            )
                                        )
                                        .catch(() =>
                                            setError(
                                                errorMessages.unableToReachNode
                                            )
                                        );
                                }}
                            />
                        </Columns.Column>
                    </Route>
                    <Route path={`${path}/${BakerSubRoutes.sign}`}>
                        <Columns.Column
                            header="Signature and Hardware Wallet"
                            className={styles.stretchColumn}
                        >
                            {transaction !== undefined &&
                            account !== undefined ? (
                                <SignTransaction
                                    transaction={transaction}
                                    account={account}
                                />
                            ) : null}
                        </Columns.Column>
                    </Route>
                </Switch>
            </Columns>
        </MultiSignatureLayout>
    );
}

interface EnterDataProps {
    data?: string;
    setData: (amount: string | undefined) => void;
}

/**
 * Allow the user to input a memo.
 */
function EnterData({ setData, data }: EnterDataProps): JSX.Element {
    const [error, setError] = useState<string>();

    const onDataChange = useCallback(
        (event: FormEvent<HTMLTextAreaElement>) => {
            const currentData = event.currentTarget.value;
            const validation = validateData(currentData);
            setError(validation);
            setData(currentData);
        },
        [setData]
    );

    return (
        <>
            <p className="mT10">
                Enter the data, which is to be registered. The cost of the
                transaction depends on the size of the data.
            </p>
            <TextArea
                value={data || ''}
                className="mT50"
                onChange={onDataChange}
                placeholder="You can add data here"
                isInvalid={Boolean(error)}
            />
            <ErrorMessage>{error}</ErrorMessage>
        </>
    );
}

export default ensureExchangeRate(RegisterData, LoadingComponent);
