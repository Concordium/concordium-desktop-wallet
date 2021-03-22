import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Switch, Route, useLocation } from 'react-router-dom';
import { push } from 'connected-react-router';
import {
    Account,
    Identity,
    TransactionKindString,
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

function nextLocation(currentLocation: string, proposalId: number) {
    switch (currentLocation) {
        case routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION:
            return routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_PICKACCOUNT;
        case routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_PICKACCOUNT:
            return routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_PICKAMOUNT;
        case routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_PICKAMOUNT:
            return routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_PICKRECIPIENT;
        case routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_PICKRECIPIENT:
            return routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_SIGNTRANSACTION;
        case routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_SIGNTRANSACTION:
            return routes.MULTISIGTRANSACTIONS_PROPOSAL_EXISTING_ACCOUNT_TRANSACTION.replace(
                ':id',
                `${proposalId}`
            );
        default:
            throw new Error('unknown location');
    }
}
/**
 * This component controls the flow of creating a multisignature account transaction.
 * It contains the logic for displaying the current parameters.
 */
export default function SimpleTransfer(): JSX.Element {
    const dispatch = useDispatch();
    const location = useLocation().pathname;

    const transactionKind = TransactionKindString.Transfer;
    const locationHandler = nextLocation;

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
                <Columns>
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
                                        pathname: locationHandler(
                                            location,
                                            proposalId
                                        ),
                                        state: transactionKind,
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
