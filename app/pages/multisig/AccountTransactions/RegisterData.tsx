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
import { validateData } from '~/utils/transactionHelpers';
import { useTransactionCostEstimate } from '~/utils/dataHooks';
import RegisterDataProposalDetails from './proposal-details/RegisterDataProposalDetails';
import { ensureExchangeRate } from '~/components/Transfers/withExchangeRate';
import LoadingComponent from './LoadingComponent';
import { AccountTransactionSubRoutes } from '~/utils/accountRouterHelpers';
import ChooseExpiry from './ChooseExpiry';
import ErrorMessage from '~/components/Form/ErrorMessage';
import TextArea from '~/components/Form/TextArea';
import { findAccountTransactionHandler } from '~/utils/transactionHandlers/HandlerFinder';
import CreateTransaction from './CreateTransaction';
import routes from '~/constants/routes.json';

import styles from './MultisignatureAccountTransactions.module.scss';

function useRouteSubTitle() {
    const match = useRouteMatch<{
        subRoute?: string;
    }>(`${routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION}/:subRoute`);
    const subRoute = match?.params.subRoute;
    if (!subRoute) {
        return 'Accounts';
    }
    switch (parseInt(subRoute, 10)) {
        case AccountTransactionSubRoutes.data:
            return 'Data to register';
        case AccountTransactionSubRoutes.expiry:
            return 'Transaction expiry time';
        case AccountTransactionSubRoutes.sign:
            return 'Signature and Hardware Wallet';
        default:
            throw new Error('Unsupported sub route');
    }
}

interface PageProps {
    exchangeRate: Fraction;
}

interface State {
    account?: Account;
}

function RegisterData({ exchangeRate }: PageProps) {
    const dispatch = useDispatch();

    const transactionKind = TransactionKindId.Register_data;

    const { state } = useLocation<State>();

    const { path, url } = useRouteMatch();
    const [account, setAccount] = useState<Account | undefined>(state?.account);
    const [data, setData] = useState<string>();

    const estimatedFee = useTransactionCostEstimate(
        transactionKind,
        exchangeRate,
        account?.signatureThreshold,
        data,
        0
    );

    const goToSubRoute = useCallback(
        (subRoute: AccountTransactionSubRoutes) =>
            dispatch(push(`${url}/${subRoute}`)),
        [dispatch, url]
    );

    const [expiryTime, setExpiryTime] = useState<Date>();

    const handler = findAccountTransactionHandler(transactionKind);

    function renderSignTransaction() {
        if (!account || !expiryTime) {
            throw new Error('Unexpected missing account and/or expiry time');
        }
        return (
            <CreateTransaction
                transactionKind={transactionKind}
                data={data}
                account={account}
                estimatedFee={estimatedFee}
                expiryTime={expiryTime}
            />
        );
    }

    const subtitle = useRouteSubTitle();

    return (
        <MultiSignatureLayout
            pageTitle={handler.title}
            stepTitle={`Transaction Proposal - ${handler.type}`}
            delegateScroll
        >
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
                <Columns.Column
                    header={subtitle}
                    className={styles.stretchColumn}
                >
                    <Switch>
                        <Route exact path={path}>
                            <div className={styles.columnContent}>
                                <div className="flexChildFill">
                                    <PickAccount
                                        setAccount={setAccount}
                                        chosenAccount={account}
                                        messageWhenEmpty="There are no accounts "
                                        onAccountClicked={() =>
                                            goToSubRoute(
                                                AccountTransactionSubRoutes.data
                                            )
                                        }
                                    />
                                </div>
                            </div>
                        </Route>
                        <Route
                            path={`${path}/${AccountTransactionSubRoutes.data}`}
                        >
                            <div className={styles.columnContent}>
                                <div className="flexChildFill">
                                    <EnterData setData={setData} data={data} />
                                </div>
                                <Button
                                    className="mT40"
                                    disabled={data === undefined}
                                    onClick={() =>
                                        goToSubRoute(
                                            AccountTransactionSubRoutes.expiry
                                        )
                                    }
                                >
                                    Continue
                                </Button>
                            </div>
                        </Route>
                        <Route
                            path={`${path}/${AccountTransactionSubRoutes.expiry}`}
                        >
                            <ChooseExpiry
                                buttonText="Continue"
                                onClick={(expiry: Date) => {
                                    setExpiryTime(expiry);
                                    goToSubRoute(
                                        AccountTransactionSubRoutes.sign
                                    );
                                }}
                            />
                        </Route>
                        <Route
                            path={`${path}/${AccountTransactionSubRoutes.sign}`}
                            render={renderSignTransaction}
                        />
                    </Switch>
                </Columns.Column>
            </Columns>
        </MultiSignatureLayout>
    );
}

interface EnterDataProps {
    data?: string;
    setData: (amount: string | undefined) => void;
}

/**
 * Allow the user to input the data, which is to be registered.
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
