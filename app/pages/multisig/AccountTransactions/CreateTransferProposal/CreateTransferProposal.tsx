import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Switch, Route, useLocation } from 'react-router-dom';
import { push, replace } from 'connected-react-router';
import clsx from 'clsx';
import PlusIcon from '@resources/svg/plus.svg';
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
import { BuildScheduleDefaults } from '~/components/BuildSchedule/util';
import {
    scheduledTransferCost,
    getTransactionKindCost,
} from '~/utils/transactionCosts';
import { ensureExchangeRate } from '~/components/Transfers/withExchangeRate';
import LoadingComponent from '../LoadingComponent';
import PickRecipient from '~/components/Transfers/PickRecipient';
import { useTransactionExpiryState } from '~/utils/dataHooks';
import {
    confirmedAccountsSelector,
    accountInfoSelector,
} from '~/features/AccountSlice';
import { validateMemo } from '~/utils/transactionHelpers';
import { collapseFraction } from '~/utils/basicHelpers';
import { toMicroUnits, displayAsGTU } from '~/utils/gtu';
import { useAsyncMemo } from '~/utils/hooks';
import { nodeSupportsMemo } from '~/node/nodeHelpers';
import { stringify } from '~/utils/JSONHelper';
import { isMultiSig, getAmountAtDisposal } from '~/utils/accountHelpers';
import UpsertAddress from '~/components/UpsertAddress';
import PickMemo from './PickMemo';
import DatePicker from '~/components/Form/DatePicker';

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
            return 'Signature and hardware wallet';
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

    const allowMemo = useAsyncMemo(nodeSupportsMemo);

    const { pathname, state } = useLocation<State>();
    const accounts = useSelector(confirmedAccountsSelector).filter(isMultiSig);
    const location = pathname.replace(`${transactionKind}`, ':transactionKind');

    const handler = findAccountTransactionHandler(transactionKind);

    const [account, setAccount] = useState<Account | undefined>(state?.account);
    const [amount, setAmount] = useState<string | undefined>();
    const [memo, setMemo] = useState<string | undefined>();
    const [shownMemoWarning, setShownMemoWarning] = useState<boolean>(false);

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

    const [scheduleLength, setScheduleLength] = useState<number>(0);
    const [estimatedFee, setFee] = useState<Fraction>();

    useEffect(() => {
        if (account) {
            if (transactionKind === TransactionKindId.Transfer_with_schedule) {
                if (scheduleLength) {
                    setFee(
                        scheduledTransferCost(
                            exchangeRate,
                            scheduleLength,
                            account.signatureThreshold,
                            memo
                        )
                    );
                } else {
                    setFee(undefined);
                }
            } else {
                setFee(
                    getTransactionKindCost(
                        transactionKind,
                        exchangeRate,
                        account.signatureThreshold,
                        memo
                    )
                );
            }
        }
    }, [account, transactionKind, setFee, scheduleLength, exchangeRate, memo]);

    const [amountError, setAmountError] = useState<string>();
    const accountInfo = useSelector(accountInfoSelector(account));

    useEffect(() => {
        const atDisposal = accountInfo ? getAmountAtDisposal(accountInfo) : 0n;
        if (
            estimatedFee &&
            amount &&
            atDisposal < toMicroUnits(amount) + collapseFraction(estimatedFee)
        ) {
            setAmountError(
                `Insufficient funds: ${displayAsGTU(atDisposal)} at disposal.`
            );
        } else {
            setAmountError(undefined);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [estimatedFee, amount, stringify(accountInfo)]);

    function continueAction(routerAction: typeof push = push) {
        const nextLocation = handler.creationLocationHandler(location);
        dispatch(
            routerAction({
                pathname: nextLocation,
                state: transactionKind,
            })
        );
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
                account={account}
                amount={toMicroUnits(amount)}
                recipient={recipient.address}
                schedule={schedule}
                memo={memo}
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
                    if (amountError) {
                        return;
                    }
                    setSchedule(newSchedule);
                    setScheduleDefaults(defaults);
                    continueAction();
                }}
                setScheduleLength={setScheduleLength}
                amount={amount}
                defaults={scheduleDefaults}
            />
        );
    }

    return (
        <MultiSignatureLayout pageTitle={handler.title} delegateScroll>
            <div className={styles.subtractContainerPadding}>
                <Columns divider columnScroll columnClassName={styles.column}>
                    <Columns.Column
                        className={clsx(
                            styles.transactionDetailsColumn,
                            styles.stretchColumn
                        )}
                        header="Transaction details"
                    >
                        <div className={styles.columnContent}>
                            <TransactionProposalDetails
                                transactionType={transactionKind}
                                account={account}
                                amount={amount}
                                recipient={recipient}
                                allowMemo={allowMemo}
                                memo={memo}
                                schedule={schedule}
                                estimatedFee={estimatedFee}
                                expiryTime={expiryTime}
                                amountError={amountError}
                            />
                        </div>
                    </Columns.Column>
                    <Columns.Column
                        header={subTitle(location)}
                        className={styles.stretchColumn}
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
                                        {allowMemo && (
                                            <PickMemo
                                                memo={memo}
                                                setMemo={setMemo}
                                                shownMemoWarning={
                                                    shownMemoWarning
                                                }
                                                setShownMemoWarning={
                                                    setShownMemoWarning
                                                }
                                            />
                                        )}
                                        <Button
                                            disabled={
                                                amount === undefined ||
                                                !!validateMemo(memo || '')
                                            }
                                            className={styles.submitButton}
                                            onClick={() => continueAction()}
                                        >
                                            Continue
                                        </Button>
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
                                        <UpsertAddress
                                            className={styles.addRecipient}
                                            onSubmit={(e) => {
                                                setRecipient(e);
                                                continueAction();
                                            }}
                                            allowAlias={false}
                                        >
                                            <PlusIcon />
                                        </UpsertAddress>
                                    </div>
                                )}
                            />
                            <Route
                                path={
                                    routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION_PICKEXPIRY
                                }
                                render={() => (
                                    <div className={styles.columnContent}>
                                        <DatePicker
                                            className="body2 mV40"
                                            label="Transaction expiry time"
                                            name="expiry"
                                            isInvalid={
                                                expiryTimeError !== undefined
                                            }
                                            error={expiryTimeError}
                                            value={expiryTime}
                                            onChange={setExpiryTime}
                                            minDate={new Date()}
                                        />
                                        <p>
                                            Choose the expiry date for the
                                            transaction.
                                        </p>
                                        <p>
                                            Committing the transaction after
                                            this date, will be rejected.
                                        </p>
                                        <Button
                                            disabled={
                                                expiryTime === undefined ||
                                                expiryTimeError !== undefined
                                            }
                                            className={styles.submitButton}
                                            onClick={() => continueAction()}
                                        >
                                            Continue
                                        </Button>
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
                                        messageWhenEmpty="There are no accounts that require multiple signatures"
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
