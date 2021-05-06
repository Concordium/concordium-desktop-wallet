import React from 'react';
import clsx from 'clsx';
import MultiSigIcon from '@resources/svg/multisig.svg';
import PendingImage from '@resources/svg/pending-small.svg';
import ShieldImage from '@resources/svg/shield.svg';
import BakerImage from '@resources/svg/baker.svg';
import { displayAsGTU } from '~/utils/gtu';
import { AccountInfo, Account, AccountStatus } from '~/utils/types';
import { isInitialAccount } from '~/utils/accountHelpers';
import SidedRow from '~/components/SidedRow';

import styles from './AccountCard.module.scss';

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
                {account.identityName} +{' '}
                <MultiSigIcon className={styles.multisig} />
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
export default function AccountCard({
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
    const accountBaker = accountInfo?.accountBaker;
    const stakedAmount = accountBaker ? BigInt(accountBaker.stakedAmount) : 0n;
    const amountAtDisposal = unShielded - scheduled - stakedAmount;
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
                left={
                    <>
                        <b className={styles.inline}>{account.name}</b>
                        {isInitialAccount(account) ? '(Initial)' : undefined}
                        {account.status === AccountStatus.Pending ? (
                            <PendingImage
                                height="20"
                                className={styles.bakerImage}
                            />
                        ) : undefined}
                        {accountInfo && accountInfo.accountBaker ? (
                            <BakerImage
                                height="25"
                                className={styles.bakerImage}
                            />
                        ) : undefined}
                    </>
                }
                right={displayIdentity(account, accountInfo)}
            />
            <SidedRow
                className={styles.row}
                left={<h3>Account Total:</h3>}
                right={
                    <h3>
                        {displayAsGTU(shielded + unShielded)}
                        {hidden}
                    </h3>
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
                right={displayAsGTU(amountAtDisposal)}
            />
            <SidedRow
                className={styles.row}
                left="- Staked:"
                right={displayAsGTU(stakedAmount)}
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
