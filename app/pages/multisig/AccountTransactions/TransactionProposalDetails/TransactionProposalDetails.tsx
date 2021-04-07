import React, { useState, useEffect } from 'react';
import {
    Account,
    Identity,
    AddressBookEntry,
    TransactionKindId,
    Schedule,
} from '~/utils/types';
import { getGTUSymbol } from '~/utils/gtu';
import styles from './TransactionProposalDetails.module.scss';
import {
    getTransactionKindCost,
    scheduledTransferCost,
} from '~/utils/transactionCosts';
import DisplayEstimatedFee from '~/components/DisplayEstimatedFee';
import ScheduleList from '~/components/ScheduleList';

interface Props {
    transactionType: TransactionKindId;
    account: Account | undefined;
    identity: Identity | undefined;
    amount: string | undefined;
    schedule: Schedule | undefined;
    recipient: AddressBookEntry | undefined;
}

const placeholder = <p className={styles.placeholder}>To be determined</p>;
const showAccount = (account: Account | AddressBookEntry) => (
    <>
        <p className={styles.value}>{account.name}</p>
        <p className={styles.note}>{account.address}</p>
    </>
);

const title = (text: string) => <p className={styles.title}>{text}</p>;
const value = (text: string) => <p className={styles.value}>{text}</p>;

export default function TransactionProposalDetails({
    identity,
    account,
    amount,
    recipient,
    schedule,
    transactionType,
}: Props) {
    const [estimatedFee, setFee] = useState<bigint | undefined>();

    const isScheduledTransfer =
        transactionType === TransactionKindId.Transfer_with_schedule;

    useEffect(() => {
        if (account) {
            if (isScheduledTransfer && schedule) {
                scheduledTransferCost(account.signatureThreshold)
                    .then((feeCalculator) =>
                        setFee(feeCalculator(schedule.length))
                    )
                    .catch(() => {});
            } else {
                getTransactionKindCost(
                    transactionType,
                    account.signatureThreshold
                )
                    .then((fee) => setFee(fee))
                    .catch(() => {});
            }
        }
    }, [account, transactionType, setFee, schedule, isScheduledTransfer]);

    return (
        <div className={styles.details}>
            {title('Identity:')}
            {identity ? value(identity.name) : placeholder}
            {title('Account:')}
            {account ? showAccount(account) : placeholder}
            {title('Amount:')}
            {amount ? value(`${getGTUSymbol()} ${amount}`) : placeholder}
            <DisplayEstimatedFee estimatedFee={estimatedFee} />
            {title('Recipient:')}
            {recipient ? showAccount(recipient) : placeholder}
            {recipient ? (
                <p className={styles.note}>Note: {recipient.note}</p>
            ) : null}
            {isScheduledTransfer ? (
                <>
                    {title('Release Schedule:')}
                    {schedule ? (
                        <ScheduleList schedule={schedule} />
                    ) : (
                        placeholder
                    )}
                </>
            ) : null}
            <br />
        </div>
    );
}
