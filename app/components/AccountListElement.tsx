import React from 'react';
import styles from './Accounts.css';
import { fromMicroUnits } from '../utils/transactionHelpers';
import { AccountInfo, Account } from '../utils/types';

interface Props {
    account: Account;
    accountInfo: AccountInfo;
    onClick: () => void;
    highlighted: boolean;
}

function sidedText(left: string, right: string) {
    return (
        <div className={styles.line}>
            <p className={styles.leftAlignedText}>{left}</p>
            <p className={styles.rightAlignedText}>{right}</p>
        </div>
    );
}

export default function AccountListElement({
    account,
    accountInfo,
    onClick,
    highlighted,
}: Props): JSX.element {
    return (
        <div
            onClick={onClick}
            key={account.address}
            className={`${styles.accountListElement} ${
                highlighted ? styles.chosenAccountListElement : null
            }`}
        >
            <div className={styles.line}>
                <p className={styles.leftAlignedText}>
                    {account.name}{' '}
                    {account.accountNumber === 0 ? '(initial)' : undefined}
                    {accountInfo && accountInfo.accountBaker
                        ? '(baker)'
                        : undefined}
                    {account.status === 'pending' ? ' ??? ' : undefined}
                </p>
                <p className={styles.rightAlignedText}>
                    {account.identityName}
                </p>
            </div>
            {sidedText(
                'Balance:',
                accountInfo ? fromMicroUnits(accountInfo.accountAmount) : '0'
            )}
            {sidedText(
                ' - At Disposal:',
                accountInfo && accountInfo.accountReleaseSchedule
                    ? fromMicroUnits(
                          accountInfo.accountAmount -
                              accountInfo.accountReleaseSchedule.total
                      )
                    : '0'
            )}
            {sidedText(' - Staked:', '0')}
        </div>
    );
}
