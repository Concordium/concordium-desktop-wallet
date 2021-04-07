import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Switch, Route, useLocation } from 'react-router-dom';
import { push } from 'connected-react-router';
import {
    Account,
    Identity,
    TransactionKindId,
    AddressBookEntry,
    Schedule,
} from '~/utils/types';
import PickAmount from './PickAmount';
import PickRecipient from '~/components/Transfers/PickRecipient';
import Columns from '~/components/Columns';
import routes from '~/constants/routes.json';
import PickIdentity from '~/pages/GenerateCredential/PickIdentity';
import PickAccount from './PickAccount';
import Button from '~/cross-app-components/Button';
import TransactionProposalDetails from './TransactionProposalDetails';
import { isValidGTUString } from '~/utils/gtu';
import CreateTransaction from './CreateTransaction';
import { findAccountTransactionHandler } from '~/utils/updates/HandlerFinder';
import BuildSchedule from './BuildSchedule';
import MultiSignatureLayout from '~/pages/multisig/MultiSignatureLayout';
import styles from './MultisignatureAccountTransactions.module.scss';

function subTitle(currentLocation: string) {
    switch (currentLocation) {
        case routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION:
            return 'Select a proposer';
        case routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_PICKACCOUNT:
            return 'Select sender account';
        case routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_PICKAMOUNT:
            return 'Input amount';
        case routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_PICKRECIPIENT:
            return 'Select recipient';
        case routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_SIGNTRANSACTION:
            return 'Signature and Hardware Wallet';
        case routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_BUILDSCHEDULE:
            return 'Setup the release schedule';
        default:
            throw new Error('unknown location');
    }
}

interface Props {
    transactionKind: TransactionKindId;
}
/**
 * This component controls the flow of creating a multisignature account transaction.
 * It contains the logic for displaying the current parameters.
 * TODO center continue button
 */
export default function SimpleTransfer({
    transactionKind,
}: Props): JSX.Element {
    const dispatch = useDispatch();
    const location = useLocation().pathname;

    const handler = findAccountTransactionHandler(transactionKind);

    const [isReady, setReady] = useState(false);
    const [account, setAccount] = useState<Account | undefined>();
    const [identity, setIdentity] = useState<Identity | undefined>();
    const [amount, setAmount] = useState<string>(''); // This is a string, to allows user input in GTU
    const [recipient, setRecipient] = useState<AddressBookEntry | undefined>();
    const [proposalId, setProposalId] = useState<number>(-1);
    const [schedule, setSchedule] = useState<Schedule>();

    function updateAmount(newAmount: string) {
        if (isValidGTUString(newAmount)) {
            setReady(true);
        }
        setAmount(newAmount);
    }

    function renderSignTransaction() {
        if (!account || !recipient) {
            throw new Error('Unexpected missing account and/or recipient');
        }
        return (
            <CreateTransaction
                transactionKind={transactionKind}
                setReady={setReady}
                recipient={recipient}
                amount={amount}
                account={account}
                schedule={schedule}
                setProposalId={setProposalId}
            />
        );
    }

    function continueAction() {
        setReady(false);
        dispatch(
            push({
                pathname: handler.creationLocationHandler(location, proposalId),
                state: transactionKind,
            })
        );
    }

    return (
        <MultiSignatureLayout
            pageTitle={handler.title}
            stepTitle="Transaction Proposal - Send GTU"
        >
            <Columns divider columnScroll>
                <Columns.Column
                    className={styles.transactionDetailsColumn}
                    header="Transaction Details"
                >
                    <TransactionProposalDetails
                        transactionType={transactionKind}
                        account={account}
                        identity={identity}
                        amount={amount}
                        recipient={recipient}
                        schedule={schedule}
                    />
                    <Button
                        disabled={!isReady}
                        className={styles.submitButton}
                        onClick={() => {
                            setReady(false);
                            dispatch(
                                push({
                                    pathname: handler.creationLocationHandler(
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
                <Columns.Column
                    className={styles.rightColumn}
                    header={subTitle(location)}
                >
                    <Switch>
                        <Route
                            path={
                                routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_BUILDSCHEDULE
                            }
                            render={() => {
                                if (!account || !recipient) {
                                    throw new Error('fuck3');
                                }
                                return (
                                    <BuildSchedule
                                        submitSchedule={(newSchedule) => {
                                            setSchedule(newSchedule);
                                            continueAction();
                                        }}
                                        amount={amount}
                                    />
                                );
                            }}
                        />
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
                            render={() => (
                                <PickAmount
                                    setReady={setReady}
                                    account={account}
                                    amount={amount}
                                    setAmount={updateAmount}
                                />
                            )}
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
        </MultiSignatureLayout>
    );
}
