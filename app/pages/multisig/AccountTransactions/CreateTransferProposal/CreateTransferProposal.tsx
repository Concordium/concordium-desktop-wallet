import React, { useRef, useState, useEffect } from 'react';
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
import PickRecipient from '../PickRecipientWrapper';
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
import { ensureExchangeRate } from '~/components/Transfers/withExchangeRate';
import LoadingComponent from '../LoadingComponent';

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
    exchangeRate: Fraction;
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
    const location = useLocation().pathname.replace(
        `${transactionKind}`,
        ':transactionKind'
    );

    const scheduleBuilderRef = useRef<ScheduledTransferBuilderRef>(null);

    const handler = findAccountTransactionHandler(transactionKind);

    const [isReady, setReady] = useState(false);
    const [account, setAccount] = useState<Account | undefined>();
    const [identity, setIdentity] = useState<Identity | undefined>();
    const [amount, setAmount] = useState<string>('0.00'); // This is a string, to allows user input in GTU
    const [recipient, setRecipient] = useState<AddressBookEntry | undefined>();

    const [schedule, setSchedule] = useState<Schedule>();
    const [
        scheduleDefaults,
        setScheduleDefaults,
    ] = useState<BuildScheduleDefaults>();

    const [estimatedFee, setFee] = useState<Fraction>();
    const [error, setError] = useState<string>();

    useEffect(() => {
        if (account) {
            if (transactionKind === TransactionKindId.Transfer_with_schedule) {
                if (schedule) {
                    scheduledTransferCost(exchangeRate, account.signatureThreshold)
                            .then((feeCalculator) =>
                                setFee(feeCalculator(schedule.length))
                        )
                        .catch(() => setError('Unable to reach Node.'));
                }
            } else {
                getTransactionKindCost(
                    transactionKind,
                    exchangeRate,
                    account.signatureThreshold
                )
                    .then((fee) => setFee(fee))
                    .catch(() => setError('Unable to reach Node.'));
            }
        }
    }, [account, transactionKind, setFee, schedule]);

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
                estimatedFee={estimatedFee}
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
                submitSchedule={(newSchedule, defaults) => {
                    setSchedule(newSchedule);
                    setScheduleDefaults(defaults);
                    continueAction();
                }}
                amount={amount}
                ref={scheduleBuilderRef}
                setReady={setReady}
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
                                            setReady={setReady}
                                            account={account}
                                            amount={amount}
                                            setAmount={updateAmount}
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
                                            setReady={setReady}
                                            setRecipient={setRecipient}
                                            recipient={recipient}
                                            senderAddress={account?.address}
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

export default ensureExchangeRate(CreateTransferProposal, LoadingComponent);
