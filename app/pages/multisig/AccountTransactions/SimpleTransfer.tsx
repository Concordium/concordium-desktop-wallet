import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Switch, Route, useLocation } from 'react-router-dom';
import { push } from 'connected-react-router';
import {
    Account,
    Identity,
    TransactionKindString,
    TransactionKindId,
    AddressBookEntry,
} from '~/utils/types';
import PickAmount from '~/components/Transfers/PickAmount';
import PickRecipient from '~/components/Transfers/PickRecipient';
import PageLayout from '~/components/PageLayout';
import Columns from '~/components/Columns';
import routes from '~/constants/routes.json';
import PickIdentity from '~/pages/GenerateCredential/PickIdentity';
import PickAccount from './PickAccount';
import Button from '~/cross-app-components/Button';
import TransactionProposalDetails from './TransactionProposalDetails';
import { isValidGTUString } from '~/utils/gtu';
import CreateTransaction from './CreateTransaction';
import { findAccountTransactionHandler } from '~/utils/updates/HandlerFinder';

/**
 * This component controls the flow of creating a multisignature account transaction.
 * It contains the logic for displaying the current parameters.
 * TODO center continue button
 */
export default function SimpleTransfer(): JSX.Element {
    const dispatch = useDispatch();
    const location = useLocation().pathname;

    const transactionKind = TransactionKindId.Simple_transfer;
    const handler = findAccountTransactionHandler(transactionKind);

    const [isReady, setReady] = useState(false);
    const [account, setAccount] = useState<Account | undefined>();
    const [identity, setIdentity] = useState<Identity | undefined>();
    const [amount, setAmount] = useState<string>(''); // This is a string, to allows user input in GTU
    const [recipient, setRecipient] = useState<AddressBookEntry | undefined>();
    const [proposalId, setProposalId] = useState<number>(-1);

    function updateAmount(newAmount: string) {
        if (isValidGTUString(newAmount)) {
            setReady(true);
        }
        setAmount(newAmount);
    }

    function renderSignTransaction() {
        if (!account || !recipient) {
            throw new Error('fuck');
        }
        return (
            <CreateTransaction
                setReady={setReady}
                recipient={recipient}
                amount={amount}
                account={account}
                setProposalId={setProposalId}
            />
        );
    }

    return (
        <PageLayout>
            <PageLayout.Header>
                <h1>Multi Signature Transactions | {transactionKind}</h1>
            </PageLayout.Header>
            <PageLayout.Container>
                <Columns divider columnScroll>
                    <Columns.Column>
                        <TransactionProposalDetails
                            transactionType={transactionKind}
                            account={account}
                            identity={identity}
                            amount={amount}
                            recipient={recipient}
                        />
                        <Button
                            disabled={!isReady}
                            onClick={() => {
                                setReady(false);
                                dispatch(
                                    push({
                                        pathname: handler.creationLocationHandler(
                                            location,
                                            proposalId
                                        ),
                                        state: TransactionKindString.Transfer,
                                    })
                                );
                            }}
                        >
                            Continue
                        </Button>
                    </Columns.Column>
                    <Columns.Column>
                        <Switch>
                            <Route
                                path={
                                    routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_PICKACCOUNT
                                }
                                render={() => (
                                    <PickAccount
                                        setReady={setReady}
                                        setAccount={setAccount}
                                        identity={identity}
                                    />
                                )}
                            />
                            <Route
                                path={
                                    routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_SIGNTRANSACTION
                                }
                                render={renderSignTransaction}
                            />
                            <Route
                                path={
                                    routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_PICKAMOUNT
                                }
                                render={() => {
                                    if (!account) {
                                        throw new Error(
                                            'Unexpected missing account'
                                        );
                                    }

                                    return (
                                        <PickAmount
                                            amount={amount}
                                            setAmount={updateAmount}
                                            header="amount"
                                        />
                                    );
                                }}
                            />
                            <Route
                                path={
                                    routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_PICKRECIPIENT
                                }
                                render={() => (
                                    <PickRecipient
                                        pickRecipient={(newRecipient) => {
                                            setReady(true);
                                            setRecipient(newRecipient);
                                        }}
                                    />
                                )}
                            />
                            <Route
                                path={
                                    routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION
                                }
                                render={() => (
                                    <PickIdentity
                                        setReady={setReady}
                                        setIdentity={setIdentity}
                                    />
                                )}
                            />
                        </Switch>
                    </Columns.Column>
                </Columns>
            </PageLayout.Container>
        </PageLayout>
    );
}
