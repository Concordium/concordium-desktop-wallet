import React, { useEffect, useState } from 'react';
import styles from './Accounts.css';
import { getAccountInfo } from '../utils/client';
import { fromMicroUnits } from '../utils/transactionHelpers';

interface Props {
    account: Account;
    latestBlockHash: string;
    onClick: () => void;
    highlighted: boolean;
}

export default function AccountListElement({
    account,
    latestBlockHash,
    onClick,
    highlighted,
}: Props): JSX.element {
    const [accountInfo, setAccountInfo] = useState(undefined);

    useEffect(() => {
        getAccountInfo(account.address, latestBlockHash)
            .then((response) => setAccountInfo(JSON.parse(response.getValue())))
            .catch(console.log);
    }, [account, latestBlockHash]);

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
