import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Switch, Route, useLocation } from 'react-router-dom';
import { push, replace } from 'connected-react-router';
import clsx from 'clsx';
import {
    Account,
    TransactionKindId,
    AddressBookEntry,
    Schedule,
    Fraction,
} from '~/utils/types';
import PickAmount from '../PickAmount';
import Columns from '~/components/Columns';
import routes from '~/constants/routes.json';
import PickAccount from '~/components/PickAccount';
import Button from '~/cross-app-components/Button';
import TransactionProposalDetails from '../proposal-details/TransferProposalDetails';
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
import { ensureExchangeRate } from '~/components/Transfers/withExchangeRate';
import LoadingComponent from '../LoadingComponent';
import InputTimestamp from '~/components/Form/InputTimestamp';
import PickRecipient from '~/components/Transfers/PickRecipient';
import { useTransactionExpiryState } from '~/utils/dataHooks';
import { isMultiSig } from '~/utils/accountHelpers';
import { accountsSelector } from '~/features/AccountSlice';

import styles from './CreateTransferProposal.module.scss';

function subTitle(currentLocation: string) {
    switch (currentLocation) {
        case routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION:
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

interface State {
    account?: Account;
}

interface Props {
    exchangeRate: Fraction;
    transactionKind:
        | TransactionKindId.Simple_transfer
        | TransactionKindId.Transfer_with_schedule;
}
/**
 * This component controls the flow of creating a multisignature account transaction.
 * It contains the logic for displaying the current parameters.
 */
function CreateTransferProposal({
    transactionKind,
    exchangeRate,
}: Props): JSX.Element {
    const dispatch = useDispatch();

    const { pathname, state } = useLocation<State>();
    const accounts = useSelector(accountsSelector)
        .filter(isMultiSig)
        .filter((_, i) => i === 0);
    const location = pathname.replace(`${transactionKind}`, ':transactionKind');
    const scheduleBuilderRef = useRef<ScheduledTransferBuilderRef>(null);

    const handler = findAccountTransactionHandler(transactionKind);

    const [account, setAccount] = useState<Account | undefined>(state?.account);
    const [amount, setAmount] = useState<string | undefined>();
    const [recipient, setRecipient] = useState<AddressBookEntry | undefined>();
    const [
        expiryTime,
        setExpiryTime,
        expiryTimeError,
    ] = useTransactionExpiryState();

    const [schedule, setSchedule] = useState<Schedule>();
    const [
        scheduleDefaults,
        setScheduleDefaults,
    ] = useState<BuildScheduleDefaults>();
    const [isScheduleReady, setScheduleReady] = useState(true);

    const [estimatedFee, setFee] = useState<Fraction>();

    const isReady = useMemo(() => {
        switch (location) {
            case routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION:
                return account !== undefined;
            case routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_BUILDSCHEDULE:
                return isScheduleReady;
            case routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_PICKAMOUNT:
                return amount !== undefined;
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
        isScheduleReady,
        location,
        recipient,
    ]);

    useEffect(() => {
        if (account) {
            if (transactionKind === TransactionKindId.Transfer_with_schedule) {
                if (schedule) {
                    setFee(
                        scheduledTransferCost(
                            exchangeRate,
                            account.signatureThreshold
                        )(schedule.length)
                    );
                } else {
                    setFee(undefined);
                }
            } else {
                setFee(
                    getTransactionKindCost(
                        transactionKind,
                        exchangeRate,
                        account.signatureThreshold
                    )
                );
            }
        }
    }, [account, transactionKind, setFee, schedule, exchangeRate]);

    function continueAction(routerAction: typeof push = push) {
        const nextLocation = handler.creationLocationHandler(location);
        dispatch(
            routerAction({
                pathname: nextLocation,
                state: transactionKind,
            })
        );
    }

    function submitSchedule() {
        scheduleBuilderRef?.current?.submitSchedule();
    }

    useEffect(() => {
        if (
            !account &&
            accounts.length === 1 &&
            location === routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION
        ) {
            setAccount(accounts[0]);
            continueAction(replace);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [account, accounts]);

    function renderSignTransaction() {
        if (!account || !recipient || !expiryTime || !amount) {
            throw new Error(
                'Unexpected missing account, amount, recipient and/or expiry time'
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

    function renderBuildSchedule() {
        if (!account || !recipient || !amount) {
            throw new Error(
                'Unexpected missing account, amount and/or recipient'
            );
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

    const showButton =
        !isSignPage &&
        location !== routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION;

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
                                            : () => continueAction()
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
                                            recipient={recipient}
                                            pickRecipient={setRecipient}
                                            senderAddress={account?.address}
                                            onClickedRecipient={continueAction}
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
                            >
                                <div className={styles.columnContent}>
                                    <PickAccount
                                        setAccount={setAccount}
                                        chosenAccount={account}
                                        filter={isMultiSig}
                                        onAccountClicked={continueAction}
                                    />
                                </div>
                            </Route>
                        </Switch>
                    </Columns.Column>
                </Columns>
            </div>
        </MultiSignatureLayout>
    );
}

export default ensureExchangeRate(CreateTransferProposal, LoadingComponent);
