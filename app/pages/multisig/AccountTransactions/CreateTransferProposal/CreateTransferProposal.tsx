import React, { useRef, useState, useEffect, useMemo } from 'react';
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
    Fraction,
} from '~/utils/types';
import PickAmount from '../PickAmount';
import Columns from '~/components/Columns';
import routes from '~/constants/routes.json';
import PickIdentity from '~/components/PickIdentity';
import PickAccount from '../PickAccount';
import Button from '~/cross-app-components/Button';
import TransactionProposalDetails from '../TransactionProposalDetails';
import { isValidGTUString } from '~/utils/gtu';
import CreateTransaction from '../CreateTransaction';
import { findAccountTransactionHandler } from '~/utils/transactionHandlers/HandlerFinder';
import BuildSchedule from '../BuildSchedule';
import MultiSignatureLayout from '~/pages/multisig/MultiSignatureLayout';
import {
    ScheduledTransferBuilderRef,
    BuildScheduleDefaults,
} from '~/components/BuildSchedule/util';
import {
    scheduledTransferCost,
    getTransactionKindCost,
} from '~/utils/transactionCosts';
import SimpleErrorModal from '~/components/SimpleErrorModal';
import styles from './CreateTransferProposal.module.scss';
import { getDefaultExpiry, isFutureDate } from '~/utils/timeHelpers';
import InputTimestamp from '~/components/Form/InputTimestamp';
import PickRecipient from '~/components/Transfers/PickRecipient';

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
        case routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_PICKEXPIRY:
            return 'Select transaction expiry time';
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
 */
export default function CreateTransferProposal({
    transactionKind,
}: Props): JSX.Element {
    const dispatch = useDispatch();
    const location = useLocation().pathname.replace(
        `${transactionKind}`,
        ':transactionKind'
    );

    const scheduleBuilderRef = useRef<ScheduledTransferBuilderRef>(null);

    const handler = findAccountTransactionHandler(transactionKind);

    const [account, setAccount] = useState<Account | undefined>();
    const [identity, setIdentity] = useState<Identity | undefined>();
    const [amount, setAmount] = useState<string>('0.00'); // This is a string, to allows user input in GTU
    const [recipient, setRecipient] = useState<AddressBookEntry | undefined>();
    const [expiryTime, setExpiryTime] = useState<Date | undefined>(
        getDefaultExpiry()
    );
    const expiryTimeError = useMemo(
        () =>
            expiryTime === undefined || isFutureDate(expiryTime)
                ? undefined
                : 'Transaction expiry time must be in the future',
        [expiryTime]
    );

    const [schedule, setSchedule] = useState<Schedule>();
    const [
        scheduleDefaults,
        setScheduleDefaults,
    ] = useState<BuildScheduleDefaults>();
    const [isScheduleReady, setScheduleReady] = useState(true);

    const [estimatedFee, setFee] = useState<Fraction>();
    const [error, setError] = useState<string>();

    const isReady = useMemo(() => {
        switch (location) {
            case routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION:
                return identity !== undefined;
            case routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_BUILDSCHEDULE:
                return isScheduleReady;
            case routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_PICKACCOUNT:
                return account !== undefined;
            case routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_PICKAMOUNT:
                return amount !== undefined && isValidGTUString(amount);
            case routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_PICKRECIPIENT:
                return recipient !== undefined;
            case routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_PICKEXPIRY:
                return (
                    expiryTime !== undefined && expiryTimeError === undefined
                );
            default:
                return false;
        }
    }, [
        account,
        amount,
        expiryTime,
        expiryTimeError,
        identity,
        isScheduleReady,
        location,
        recipient,
    ]);

    useEffect(() => {
        if (account) {
            if (transactionKind === TransactionKindId.Transfer_with_schedule) {
                if (schedule) {
                    scheduledTransferCost(account.signatureThreshold)
                        .then((feeCalculator) =>
                            setFee(feeCalculator(schedule.length))
                        )
                        .catch(() => setError('Unable to reach Node.'));
                }
            } else {
                getTransactionKindCost(
                    transactionKind,
                    account.signatureThreshold
                )
                    .then((fee) => setFee(fee))
                    .catch(() => setError('Unable to reach Node.'));
            }
        }
    }, [account, transactionKind, setFee, schedule]);

    function renderSignTransaction() {
        if (!account || !recipient || !expiryTime) {
            throw new Error(
                'Unexpected missing account and/or recipient and/or expiry time'
            );
        }
        return (
            <CreateTransaction
                transactionKind={transactionKind}
                recipient={recipient}
                amount={amount}
                account={account}
                schedule={schedule}
                estimatedFee={estimatedFee}
                expiryTime={expiryTime}
            />
        );
    }

    function continueAction() {
        const nextLocation = handler.creationLocationHandler(location);
        dispatch(
            push({
                pathname: nextLocation,
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
                submitSchedule={(newSchedule, defaults) => {
                    setSchedule(newSchedule);
                    setScheduleDefaults(defaults);
                    continueAction();
                }}
                amount={amount}
                ref={scheduleBuilderRef}
                setReady={setScheduleReady}
                defaults={scheduleDefaults}
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
            <SimpleErrorModal
                show={Boolean(error)}
                header="Unable to perform transfer"
                content={error}
                onClick={() => dispatch(push(routes.MULTISIGTRANSACTIONS))}
            />
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
                                estimatedFee={estimatedFee}
                                expiryTime={expiryTime}
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
                                            setAccount={setAccount}
                                            identity={identity}
                                            chosenAccount={account}
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
                                            account={account}
                                            amount={amount}
                                            setAmount={setAmount}
                                            estimatedFee={estimatedFee}
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
                                            pickRecipient={setRecipient}
                                            senderAddress={account?.address}
                                        />
                                    </div>
                                )}
                            />
                            <Route
                                path={
                                    routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_PICKEXPIRY
                                }
                                render={() => (
                                    <div className={styles.columnContent}>
                                        <InputTimestamp
                                            label="Transaction expiry time"
                                            name="expiry"
                                            isInvalid={
                                                expiryTimeError !== undefined
                                            }
                                            error={expiryTimeError}
                                            value={expiryTime}
                                            onChange={setExpiryTime}
                                        />
                                        <p>
                                            Choose the expiry date for the
                                            transaction.
                                        </p>
                                        <p>
                                            Committing the transaction after
                                            this date, will be rejected.
                                        </p>
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
                                            setIdentity={setIdentity}
                                            chosenIdentity={identity}
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
