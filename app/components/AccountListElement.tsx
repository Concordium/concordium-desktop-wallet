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
            {account.status} {account.name}{' '}
            {account.accountNumber === 0 ? '(initial)' : undefined}
            <pre>
                {account.identityId}
                {'\n'}
                Balance:{' '}
                {accountInfo ? fromMicroUnits(accountInfo.accountAmount) : '0'}
                {'\n'}
                At Disposal:{' '}
                {accountInfo && accountInfo.accountReleaseSchedule
                    ? fromMicroUnits(
                          accountInfo.accountAmount -
                              accountInfo.accountReleaseSchedule.total
                      )
                    : '0'}
            </pre>
        </div>
    );
}
