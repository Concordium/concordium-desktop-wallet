import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { push, replace } from 'connected-react-router';
import { LocationDescriptorObject } from 'history';
import { stringify, parse } from '~/utils/JSONHelper';
import routes from '~/constants/routes.json';
import { Account, AddressBookEntry, Schedule } from '~/utils/types';
import { displayAsCcd, microCcdToCcd } from '~/utils/ccd';
import { collapseFraction } from '~/utils/basicHelpers';
import {
    createScheduledTransferWithMemoTransaction,
    createScheduledTransferTransaction,
} from '~/utils/transactionHelpers';
import { getAmountAtDisposal } from '~/utils/accountHelpers';
import RegularInterval from '~/components/BuildSchedule/BuildRegularInterval';
import ExplicitSchedule from '~/components/BuildSchedule/BuildExplicitSchedule';
import { BuildScheduleDefaults } from '~/components/BuildSchedule/util';
import { scheduledTransferCost } from '~/utils/transactionCosts';
import TransferView from '~/components/Transfers/TransferView';
import DisplayEstimatedFee from '~/components/DisplayEstimatedFee';
import { chosenAccountInfoSelector } from '~/features/AccountSlice';
import ErrorMessage from '~/components/Form/ErrorMessage';
import Radios from '~/components/Form/Radios';

import styles from './BuildSchedule.module.scss';

interface State {
    account: Account;
    amount: string;
    recipient: AddressBookEntry;
    exchangeRate: string;
    nonce: string;
    defaults?: BuildScheduleDefaults;
    memo?: string;
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
        memo,
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
                ? scheduledTransferCost(
                      parse(exchangeRate),
                      scheduleLength,
                      1,
                      memo
                  )
                : undefined,
        [exchangeRate, memo, scheduleLength]
    );

    const [amountError, setAmountError] = useState<string>();

    useEffect(() => {
        if (!accountInfo) {
            return;
        }

        const atDisposal = getAmountAtDisposal(accountInfo);
        if (
            estimatedFee &&
            atDisposal < BigInt(amount) + collapseFraction(estimatedFee)
        ) {
            setAmountError(
                `Insufficient funds: ${displayAsCcd(atDisposal)} at disposal.`
            );
        } else {
            setAmountError(undefined);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [estimatedFee, amount, stringify(accountInfo)]);

    const createTransaction = useCallback(
        (schedule: Schedule, recoverState: unknown) => {
            if (amountError) {
                return;
            }
            let transaction;
            if (memo) {
                transaction = createScheduledTransferWithMemoTransaction(
                    account.address,
                    recipient.address,
                    schedule,
                    parse(nonce),
                    memo
                );
            } else {
                transaction = createScheduledTransferTransaction(
                    account.address,
                    recipient.address,
                    schedule,
                    parse(nonce)
                );
            }
            transaction.estimatedFee = estimatedFee;
            const transactionJSON = stringify(transaction);

            dispatch(
                replace(routes.ACCOUNTS_SCHEDULED_TRANSFER, {
                    account,
                    amount,
                    defaults: recoverState,
                    recipient,
                    nonce,
                    memo,
                    exchangeRate,
                })
            );
            dispatch(
                push({
                    pathname: routes.SUBMITTRANSFER,
                    state: {
                        confirmed: {
                            pathname: routes.ACCOUNTS_FINAL_PAGE,
                            state: {
                                transaction: transactionJSON,
                                account,
                                recipient,
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
                        state: {
                            amount: microCcdToCcd(amount),
                            recipient,
                            memo,
                        },
                    })
                )
            }
        >
            <div className={styles.buildScheduleCommon}>
                <h3 className={styles.title}> Send CCD with a schedule </h3>
                <div className="body3">
                    <h2 className="m0">
                        {displayAsCcd(amount)} to {recipient.name}
                    </h2>
                    <DisplayEstimatedFee estimatedFee={estimatedFee} />
                    <ErrorMessage>{amountError}</ErrorMessage>
                </div>
                <Radios
                    options={[
                        { label: 'Regular interval', value: false },
                        { label: 'Explicit schedule', value: true },
                    ]}
                    value={explicit}
                    onChange={setExplicit}
                    label="Schedule type:"
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
