import React, { useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Switch, Route, useLocation } from 'react-router-dom';
import { push } from 'connected-react-router';
import clsx from 'clsx';
import {
    Account,
    Identity,
    TransactionKindId,
    AddressBookEntry,
    Schedule,
} from '~/utils/types';
import PickAmount from '../PickAmount';
import PickRecipient from '~/components/Transfers/PickRecipient';
import Columns from '~/components/Columns';
import routes from '~/constants/routes.json';
import PickIdentity from '~/components/PickIdentity';
import PickAccount from '../PickAccount';
import Button from '~/cross-app-components/Button';
import TransactionProposalDetails from '../TransactionProposalDetails';
import { isValidGTUString } from '~/utils/gtu';
import CreateTransaction from '../CreateTransaction';
import { findAccountTransactionHandler } from '~/utils/updates/HandlerFinder';
import BuildSchedule from '../BuildSchedule';
import MultiSignatureLayout from '~/pages/multisig/MultiSignatureLayout';
import styles from './CreateTransferProposal.module.scss';
import { ScheduledTransferBuilderRef } from '~/components/BuildSchedule/util';

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
export default function CreateTransferProposal({
    transactionKind,
}: Props): JSX.Element {
    const dispatch = useDispatch();
    const location = useLocation().pathname;
    const scheduleBuilderRef = useRef<ScheduledTransferBuilderRef>(null);

    const handler = findAccountTransactionHandler(transactionKind);

    const [isReady, setReady] = useState(false);
    const [account, setAccount] = useState<Account | undefined>();
    const [identity, setIdentity] = useState<Identity | undefined>();
    const [amount, setAmount] = useState<string>(''); // This is a string, to allows user input in GTU
    const [recipient, setRecipient] = useState<AddressBookEntry | undefined>();
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
                recipient={recipient}
                amount={amount}
                account={account}
                schedule={schedule}
            />
        );
    }

    function continueAction() {
        setReady(false);
        dispatch(
            push({
                pathname: handler.creationLocationHandler(location),
                state: transactionKind,
            })
        );
    }

    function submitSchedule() {
        scheduleBuilderRef?.current?.submitSchedule();
    }

    function renderBuildSchedule() {
        if (!account || !recipient) {
            throw new Error('Unexpected missing account and/or recipient');
        }
        return (
            <BuildSchedule
                submitSchedule={(newSchedule) => {
                    setSchedule(newSchedule);
                    continueAction();
                }}
                amount={amount}
                ref={scheduleBuilderRef}
                setReady={setReady}
            />
        );
    }

    const isSignPage =
        location ===
        routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_SIGNTRANSACTION;
    const isBuildSchedulePage =
        location ===
        routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_BUILDSCHEDULE;

    const showButton = !isSignPage;

    return (
        <MultiSignatureLayout
            pageTitle={handler.title}
            stepTitle={`Transaction Proposal - ${handler.type}`}
            delegateScroll
        >
            <div className={styles.subtractContainerPadding}>
                <Columns divider columnScroll columnClassName={styles.column}>
                    <Columns.Column
                        className={clsx(
                            styles.transactionDetailsColumn,
                            styles.stretchColumn
                        )}
                        header="Transaction Details"
                    >
                        <div className={styles.columnContent}>
                            <TransactionProposalDetails
                                transactionType={transactionKind}
                                account={account}
                                identity={identity}
                                amount={amount}
                                recipient={recipient}
                                schedule={schedule}
                            />
                            {showButton && (
                                <Button
                                    disabled={!isReady}
                                    className={styles.submitButton}
                                    onClick={
                                        isBuildSchedulePage
                                            ? submitSchedule
                                            : continueAction
                                    }
                                >
                                    Continue
                                </Button>
                            )}
                        </div>
                    </Columns.Column>
                    <Columns.Column
                        header={subTitle(location)}
                        className={clsx(
                            (isSignPage || isBuildSchedulePage) &&
                                styles.stretchColumn
                        )}
                    >
                        <Switch>
                            <Route
                                path={
                                    routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_BUILDSCHEDULE
                                }
                                render={() => (
                                    <div className={styles.columnContent}>
                                        {renderBuildSchedule()}
                                    </div>
                                )}
                            />
                            <Route
                                path={
                                    routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_PICKACCOUNT
                                }
                                render={() => (
                                    <div className={styles.columnContent}>
                                        <PickAccount
                                            setReady={setReady}
                                            setAccount={setAccount}
                                            identity={identity}
                                        />
                                    </div>
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
                                    <div className={styles.columnContent}>
                                        <PickAmount
                                            setReady={setReady}
                                            account={account}
                                            amount={amount}
                                            setAmount={updateAmount}
                                        />
                                    </div>
                                )}
                            />
                            <Route
                                path={
                                    routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_PICKRECIPIENT
                                }
                                render={() => (
                                    <div className={styles.columnContent}>
                                        <PickRecipient
                                            pickRecipient={(newRecipient) => {
                                                setReady(true);
                                                setRecipient(newRecipient);
                                            }}
                                        />
                                    </div>
                                )}
                            />
                            <Route
                                path={
                                    routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION
                                }
                                render={() => (
                                    <div className={styles.columnContent}>
                                        <PickIdentity
                                            setReady={setReady}
                                            setIdentity={setIdentity}
                                        />
                                    </div>
                                )}
                            />
                        </Switch>
                    </Columns.Column>
                </Columns>
            </div>
        </MultiSignatureLayout>
    );
}
