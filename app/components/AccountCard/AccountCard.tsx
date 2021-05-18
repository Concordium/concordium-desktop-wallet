import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import clsx from 'clsx';
import MultiSigIcon from '@resources/svg/multisig.svg';
import PendingImage from '@resources/svg/pending-small.svg';
import RejectedImage from '@resources/svg/warning.svg';
import ShieldImage from '@resources/svg/shield.svg';
import BakerImage from '@resources/svg/baker.svg';
import LedgerImage from '@resources/svg/ledger.svg';
import { displayAsGTU } from '~/utils/gtu';
import { AccountInfo, Account, AccountStatus } from '~/utils/types';
import { isInitialAccount } from '~/utils/accountHelpers';
import SidedRow from '~/components/SidedRow';
import { walletIdSelector } from '~/features/WalletSlice';
import { findLocalDeployedCredential } from '~/utils/credentialHelper';

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
    const walletId = useSelector(walletIdSelector);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        if (walletId) {
            findLocalDeployedCredential(walletId, account.address)
                .then((cred) => setConnected(Boolean(cred)))
                .catch(() => setConnected(false));
        } else {
            setConnected(false);
        }
    }, [walletId, account.address]);

    const shielded = account.totalDecrypted
        ? BigInt(account.totalDecrypted)
        : 0n;
    const unShielded = accountInfo ? BigInt(accountInfo.accountAmount) : 0n;
    const scheduled =
        accountInfo && accountInfo.accountReleaseSchedule
            ? BigInt(accountInfo.accountReleaseSchedule.total)
            : 0n;
    const hidden = account.allDecrypted || (
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
                        {isInitialAccount(account) && '(Initial)'}
                        {account.status === AccountStatus.Pending && (
                            <PendingImage
                                height="24"
                                className={styles.statusImage}
                            />
                        )}
                        {account.status === AccountStatus.Rejected && (
                            <RejectedImage
                                height="28"
                                className={styles.statusImage}
                            />
                        )}
                        {accountInfo && accountInfo.accountBaker && (
                            <BakerImage
                                height="25"
                                className={styles.bakerImage}
                            />
                        )}
                    </>
                }
                right={
                    <>
                        {connected && <LedgerImage className="mR20" />}
                        {displayIdentity(account, accountInfo)}
                    </>
                }
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
                className={clsx(styles.row, 'mB0')}
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
