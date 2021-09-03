import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { push } from 'connected-react-router';
import { LocationDescriptorObject } from 'history';
import { stringify, parse } from '~/utils/JSONHelper';
import routes from '~/constants/routes.json';
import { Account, AddressBookEntry, Schedule } from '~/utils/types';
import { displayAsGTU, microGtuToGtu } from '~/utils/gtu';
import { collapseFraction } from '~/utils/basicHelpers';
import {
    createScheduledTransferTransaction,
    amountAtDisposal,
} from '~/utils/transactionHelpers';
import locations from '~/constants/transferLocations.json';
import RegularInterval from '~/components/BuildSchedule/BuildRegularInterval';
import ExplicitSchedule from '~/components/BuildSchedule/BuildExplicitSchedule';
import { BuildScheduleDefaults } from '~/components/BuildSchedule/util';
import { scheduledTransferCost } from '~/utils/transactionCosts';
import TransferView from '~/components/Transfers/TransferView';
import styles from './BuildSchedule.module.scss';
import DisplayEstimatedFee from '~/components/DisplayEstimatedFee';
import ButtonGroup from '~/components/ButtonGroup';
import { chosenAccountInfoSelector } from '~/features/AccountSlice';

interface State {
    account: Account;
    amount: string;
    recipient: AddressBookEntry;
    exchangeRate: string;
    nonce: string;
    defaults?: BuildScheduleDefaults;
}

interface Props {
    location: LocationDescriptorObject<State>;
}

/**
 * Allows the user to build the schedule of a scheduled transfer.
 */
export default function BuildSchedule({ location }: Props) {
    const [explicit, setExplicit] = useState<boolean>(
        location?.state?.defaults?.explicit || false
    );
    const dispatch = useDispatch();

    if (!location.state) {
        throw new Error('Unexpected missing state.');
    }

    const {
        account,
        amount,
        recipient,
        nonce,
        exchangeRate,
        defaults,
    } = location.state;

    const [scheduleLength, setScheduleLength] = useState<number>(0);
    const accountInfo = useSelector(chosenAccountInfoSelector);

    const estimatedFee = useMemo(
        () =>
            scheduleLength
                ? scheduledTransferCost(parse(exchangeRate))(scheduleLength)
                : undefined,
        [exchangeRate, scheduleLength]
    );

    const [amountError, setAmountError] = useState<string>();

    useEffect(() => {
        const atDisposal = amountAtDisposal(accountInfo);
        if (
            estimatedFee &&
            atDisposal < BigInt(amount) + collapseFraction(estimatedFee)
        ) {
            setAmountError(
                `Insufficient funds: ${displayAsGTU(atDisposal)} at disposal.`
            );
        } else {
            setAmountError(undefined);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [estimatedFee, amount, JSON.stringify(accountInfo)]);

    const createTransaction = useCallback(
        (schedule: Schedule, recoverState: unknown) => {
            if (amountError) {
                return;
            }
            const transaction = createScheduledTransferTransaction(
                account.address,
                recipient.address,
                schedule,
                nonce
            );
            transaction.estimatedFee = estimatedFee;
            const transactionJSON = stringify(transaction);
            dispatch(
                push({
                    pathname: routes.SUBMITTRANSFER,
                    state: {
                        confirmed: {
                            pathname: routes.ACCOUNTS_CREATESCHEDULEDTRANSFER,
                            state: {
                                transaction: transactionJSON,
                                account,
                                recipient,
                                initialPage: locations.transferSubmitted,
                            },
                        },
                        cancelled: {
                            pathname: routes.ACCOUNTS_SCHEDULED_TRANSFER,
                            state: {
                                account,
                                amount,
                                defaults: recoverState,
                                recipient,
                                nonce,
                                exchangeRate,
                            },
                        },
                        transaction: transactionJSON,
                        account,
                    },
                })
            );
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [JSON.stringify(account), estimatedFee, recipient, amountError]
    );

    const BuildComponent = explicit ? ExplicitSchedule : RegularInterval;

    return (
        <TransferView
            className={styles.buildSchedule}
            showBack
            backOnClick={() =>
                dispatch(
                    push({
                        pathname: routes.ACCOUNTS_CREATESCHEDULEDTRANSFER,
                        state: { amount: microGtuToGtu(amount), recipient },
                    })
                )
            }
        >
            <div className={styles.buildScheduleCommon}>
                <h3 className={styles.title}> Send GTU with a schedule </h3>
                <div className="body3">
                    <h2 className="m0">
                        {displayAsGTU(amount)} to {recipient.name}
                    </h2>
                    <DisplayEstimatedFee estimatedFee={estimatedFee} />
                    <p className={styles.errorLabel}>{amountError}</p>
                </div>
                <ButtonGroup
                    buttons={[
                        { label: 'Regular Interval', value: false },
                        { label: 'Explicit Schedule', value: true },
                    ]}
                    isSelected={({ value }) => value === explicit}
                    onClick={({ value }) => setExplicit(value)}
                    name="scheduleType"
                    title="Schedule type:"
                />
            </div>
            <BuildComponent
                defaults={defaults}
                setScheduleLength={setScheduleLength}
                submitSchedule={createTransaction}
                amount={BigInt(amount)}
                submitButtonSize="big"
            />
        </TransferView>
    );
}
