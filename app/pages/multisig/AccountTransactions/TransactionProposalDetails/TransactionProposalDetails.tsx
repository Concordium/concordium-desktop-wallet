import React from 'react';
import {
    Account,
    Identity,
    AddressBookEntry,
    TransactionKindId,
    Schedule,
    Fraction,
} from '~/utils/types';
import { getGTUSymbol } from '~/utils/gtu';
import styles from './TransactionProposalDetails.module.scss';
import DisplayEstimatedFee from '~/components/DisplayEstimatedFee';
import ScheduleList from '~/components/ScheduleList';

interface Props {
    transactionType: TransactionKindId;
    account?: Account;
    identity?: Identity;
    amount?: string;
    recipient?: AddressBookEntry;
    schedule?: Schedule;
    estimatedFee?: Fraction;
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
    estimatedFee,
}: Props) {
    const isScheduledTransfer =
        transactionType === TransactionKindId.Transfer_with_schedule;

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
