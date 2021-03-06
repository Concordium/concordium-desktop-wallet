import clsx from 'clsx';
import React, { ReactNode } from 'react';
import { getCcdSymbol } from '~/utils/ccd';
import { AddressBookEntry, Account } from '~/utils/types';
import DisplayAddress from '~/components/DisplayAddress';

import styles from './ProposalDetails.module.scss';

const placeholder = <p className={styles.placeholder}>To be determined</p>;

const formatValue = (text: ReactNode) => <p className={styles.value}>{text}</p>;
export const formatNote = (text: ReactNode) => (
    <p className={styles.note}>{text}</p>
);

const formatAccount = (account: Account | AddressBookEntry) => (
    <>
        <div className="mB10">
            {formatValue(account.name)}
            {'note' in account && formatNote(account.note)}
        </div>
        <DisplayAddress className={styles.address} address={account.address} />
    </>
);
const formatAmount = (amount: string) =>
    formatValue(`${getCcdSymbol()}${amount}`);
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
    first?: boolean;
};

export function PlainDetail<A>({
    title,
    value,
    format = formatValue,
    first = false,
}: DetailProps<A>) {
    return (
        <>
            <p className={clsx(styles.title, first && 'mT0')}>{title}:</p>
            {value !== undefined ? format(value) : placeholder}
        </>
    );
}

export function AccountDetail({
    title,
    value,
    format = formatAccount,
    first = false,
}: DetailProps<Account | AddressBookEntry>) {
    return (
        <PlainDetail
            title={title}
            value={value}
            format={format}
            first={first}
        />
    );
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

export function TitleDetail({ title, first = false }: DetailProps<never>) {
    return <p className={clsx(styles.title, first && 'mT0')}>{title}</p>;
}
