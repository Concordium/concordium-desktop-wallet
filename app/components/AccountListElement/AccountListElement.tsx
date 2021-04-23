import React from 'react';
import clsx from 'clsx';
import MultiSigIcon from '@resources/svg/multisig.svg';
import PendingImage from '@resources/svg/pending_old.svg';
import ShieldImage from '@resources/svg/shield.svg';
import { displayAsGTU } from '~/utils/gtu';
import { AccountInfo, Account, AccountStatus } from '~/utils/types';
import { isInitialAccount } from '~/utils/accountHelpers';
import SidedRow from '~/components/SidedRow';

import styles from './AccountListElement.module.scss';

function displayIdentity(
    account: Account,
    accountInfo: AccountInfo | undefined
) {
    if (
        accountInfo &&
        Object.values(accountInfo.accountCredentials).length > 1
    ) {
        return (
            <>
                {account.identityName} + <MultiSigIcon height="15" />
            </>
        );
    }
    return account.identityName;
}

interface Props {
    account: Account;
    accountInfo?: AccountInfo;
    onClick?(shielded: boolean): void;
    active?: boolean;
    className?: string;
}

/**
 * Displays the information and balances of the given account.
 * Takes an onClick, which is triggered by when clicking either
 * the shielded balance (with argument true)
 * or the public balances (with argument false)
 */
export default function AccountListElement({
    account,
    accountInfo,
    onClick,
    className,
    active = false,
}: Props): JSX.Element {
    const shielded = account.totalDecrypted
        ? BigInt(account.totalDecrypted)
        : 0n;
    const unShielded = accountInfo ? BigInt(accountInfo.accountAmount) : 0n;
    const scheduled =
        accountInfo && accountInfo.accountReleaseSchedule
            ? BigInt(accountInfo.accountReleaseSchedule.total)
            : 0n;
    const hidden = account.allDecrypted ? null : (
        <>
            {' '}
            + <ShieldImage height="15" />
        </>
    );

    return (
        <div
            className={clsx(
                styles.accountListElement,
                className,
                active && styles.active,
                Boolean(onClick) && styles.clickable
            )}
            onClick={() => onClick && onClick(false)}
            onKeyPress={() => onClick && onClick(false)}
            tabIndex={0}
            role="button"
        >
            <SidedRow
                className={styles.firstRow}
                left={
                    <>
                        <b className={styles.inline}>
                            {account.name}
                            {account.status === AccountStatus.Pending ? (
                                <PendingImage />
                            ) : undefined}
                        </b>
                        {isInitialAccount(account) ? <>(Initial)</> : undefined}
                        {accountInfo && accountInfo.accountBaker ? (
                            <>(baker)</>
                        ) : undefined}
                    </>
                }
                right={displayIdentity(account, accountInfo)}
            />
            <SidedRow
                className={styles.row}
                left={<h2>Account Total:</h2>}
                right={
                    <>
                        {displayAsGTU(shielded + unShielded)}
                        {hidden}
                    </>
                }
            />
            <div className={styles.dividingLine} />
            <SidedRow
                className={styles.row}
                left={<h3>Balance:</h3>}
                right={<h3>{displayAsGTU(unShielded)}</h3>}
            />
            <SidedRow
                className={styles.row}
                left="- At Disposal:"
                right={displayAsGTU(unShielded - scheduled)}
            />
            <SidedRow
                className={styles.row}
                left="- Staked:"
                right={displayAsGTU(unShielded - scheduled)}
            />
            <div className={styles.dividingLine} />
            <SidedRow
                className={styles.row}
                left={<h3>Shielded Balance:</h3>}
                right={
                    <h3>
                        {displayAsGTU(shielded)}
                        {hidden}
                    </h3>
                }
                onClick={(e) => {
                    e.stopPropagation(); // So that we avoid triggering the parent's onClick
                    return onClick && onClick(true);
                }}
            />
        </div>
    );
}
