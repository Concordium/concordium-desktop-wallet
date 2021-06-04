import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import clsx from 'clsx';
import MultiSigIcon from '@resources/svg/multisig.svg';
import PendingImage from '@resources/svg/pending-small.svg';
import RejectedImage from '@resources/svg/warning.svg';
import ShieldImage from '@resources/svg/shield.svg';
import BakerImage from '@resources/svg/baker.svg';
import ReadonlyImage from '@resources/svg/read-only.svg';
import LedgerImage from '@resources/svg/ledger.svg';
import { displayAsGTU } from '~/utils/gtu';
import { AccountInfo, Account, AccountStatus, ClassName } from '~/utils/types';
import { isInitialAccount } from '~/utils/accountHelpers';
import SidedRow from '~/components/SidedRow';
import { walletIdSelector } from '~/features/WalletSlice';
import { findLocalDeployedCredential } from '~/utils/credentialHelper';
import { accountHasDeployedCredentialsSelector } from '~/features/CredentialSlice';

import styles from './AccountCard.module.scss';

interface ViewProps extends ClassName {
    accountName: string;
    identityName?: string;
    onClick?(shielded: boolean): void;
    active?: boolean;
    initialAccount?: boolean;
    accountStatus?: AccountStatus;
    connected?: boolean;
    multiSig?: boolean;
    isBaker?: boolean;
    hasEncryptedFunds?: boolean;
    hasDeployedCredentials?: boolean;
    shielded?: bigint;
    unShielded?: bigint;
    amountAtDisposal?: bigint;
    stakedAmount?: bigint;
}

export function AccountCardView({
    className,
    active = false,
    onClick,
    accountName,
    initialAccount = false,
    isBaker = false,
    accountStatus,
    hasDeployedCredentials = false,
    connected = false,
    multiSig = false,
    identityName,
    shielded = 0n,
    unShielded = 0n,
    hasEncryptedFunds = false,
    amountAtDisposal = 0n,
    stakedAmount = 0n,
}: ViewProps): JSX.Element {
    const hidden = hasEncryptedFunds && !multiSig && (
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
                left={
                    <>
                        <b className={styles.inline}>{accountName}</b>
                        {initialAccount && <>&nbsp;(Initial)</>}
                        {accountStatus === AccountStatus.Pending && (
                            <PendingImage
                                height="24"
                                className={styles.statusImage}
                            />
                        )}
                        {accountStatus === AccountStatus.Rejected && (
                            <RejectedImage
                                height="28"
                                className={styles.statusImage}
                            />
                        )}
                        {isBaker && (
                            <BakerImage
                                height="25"
                                className={styles.bakerImage}
                            />
                        )}
                        {accountStatus === AccountStatus.Confirmed &&
                            !hasDeployedCredentials && (
                                <ReadonlyImage
                                    height="15"
                                    className={styles.statusImage}
                                />
                            )}
                    </>
                }
                right={
                    <>
                        {connected && <LedgerImage className="mR20" />}
                        {multiSig ? (
                            <>
                                {identityName} +{' '}
                                <MultiSigIcon className={styles.multisig} />
                            </>
                        ) : (
                            identityName
                        )}
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

interface Props extends Pick<ViewProps, 'active' | 'onClick' | 'className'> {
    account: Account;
    accountInfo?: AccountInfo;
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
    ...viewProps
}: Props): JSX.Element {
    const walletId = useSelector(walletIdSelector);
    const [connected, setConnected] = useState(false);
    const accountHasDeployedCredentials = useSelector(
        accountHasDeployedCredentialsSelector(account)
    );

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
    const accountBaker = accountInfo?.accountBaker;
    const stakedAmount = accountBaker ? BigInt(accountBaker.stakedAmount) : 0n;
    const amountAtDisposal = unShielded - scheduled - stakedAmount;

    return (
        <AccountCardView
            {...viewProps}
            hasEncryptedFunds={!account.allDecrypted}
            shielded={shielded}
            unShielded={unShielded}
            amountAtDisposal={amountAtDisposal}
            stakedAmount={stakedAmount}
            connected={connected}
            hasDeployedCredentials={accountHasDeployedCredentials}
            accountName={account.name}
            accountStatus={account.status}
            multiSig={
                accountInfo &&
                Object.values(accountInfo.accountCredentials).length > 1
            }
            identityName={account.identityName}
            isBaker={Boolean(accountBaker)}
            initialAccount={isInitialAccount(account)}
        />
    );
}
