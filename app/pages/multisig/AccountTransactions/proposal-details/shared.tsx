import React, { ReactNode } from 'react';
import { getGTUSymbol } from '~/utils/gtu';
import { AddressBookEntry, Account } from '~/utils/types';
import styles from './ProposalDetails.module.scss';

const placeholder = <p className={styles.placeholder}>To be determined</p>;

const formatValue = (text: ReactNode) => <p className={styles.value}>{text}</p>;
export const formatNote = (text: ReactNode) => (
    <p className={styles.note}>{text}</p>
);
const formatAccount = (account: Account | AddressBookEntry) => (
    <>
        {formatValue(account.name)}
        {formatNote('note' in account ? account.note : account.address)}
    </>
);
const formatAmount = (amount: string) =>
    formatValue(`${getGTUSymbol()} ${amount}`);
const formatEnabled = (enable: boolean) => formatValue(enable ? 'Yes' : 'No');

export type DetailsProps = {
    children: ReactNode;
};

export function Details({ children }: DetailsProps) {
    return <div className={styles.details}>{children}</div>;
}

export type DetailProps<A> = {
    title: ReactNode;
    value?: A;
    format?: (a: A) => ReactNode;
};

export function PlainDetail<A>({
    title,
    value,
    format = formatValue,
}: DetailProps<A>) {
    return (
        <>
            <p className={styles.title}>{title}:</p>
            {value !== undefined ? format(value) : placeholder}
        </>
    );
}

export function AccountDetail({
    title,
    value,
    format = formatAccount,
}: DetailProps<Account | AddressBookEntry>) {
    return <PlainDetail title={title} value={value} format={format} />;
}

export function AmountDetail({
    title,
    value,
    format = formatAmount,
}: DetailProps<string>) {
    return <PlainDetail title={title} value={value} format={format} />;
}

export function EnabledDetail({
    title,
    value,
    format = formatEnabled,
}: DetailProps<boolean>) {
    return <PlainDetail title={title} value={value} format={format} />;
}
