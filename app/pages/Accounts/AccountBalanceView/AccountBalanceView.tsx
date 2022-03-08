import React from 'react';
import clsx from 'clsx';
import { useDispatch, useSelector } from 'react-redux';
import ShieldImage from '@resources/svg/shield.svg';
import BakerImage from '@resources/svg/baker.svg';
import ArrowIcon from '@resources/svg/back-arrow.svg';
import type { DelegationTarget } from '@concordium/node-sdk';
import {
    isBakerAccount,
    isDelegatorAccount,
} from '@concordium/node-sdk/lib/src/accountHelpers';
import { DelegationTargetType } from '@concordium/node-sdk/lib/src/types';
import Button from '~/cross-app-components/Button';
import Card from '~/cross-app-components/Card';
import { displayAsGTU } from '~/utils/gtu';
import { Account, AccountInfo } from '~/utils/types';
import {
    setViewingShieldedAndReset,
    viewingShieldedSelector,
} from '~/features/TransactionSlice';
import {
    chosenAccountSelector,
    chosenAccountInfoSelector,
    accountsSelector,
    previousConfirmedAccount,
    nextConfirmedAccount,
} from '~/features/AccountSlice';
import SidedRow from '~/components/SidedRow';
import AccountName from './AccountName';
import AccountDefaultButton from './AccountDefaultButton';
import { getPublicAccountAmounts } from '~/utils/accountHelpers';

import styles from './AccountBalanceView.module.scss';

interface ShieldedInfoProps {
    account: Account;
}

function ShieldedInfo({
    account: { totalDecrypted = '0', allDecrypted },
}: ShieldedInfoProps) {
    return (
        <>
            <ShieldImage className={styles.backgroundImage} />
            <h1 className={clsx(styles.shieldedAmount, 'mV20')}>
                {displayAsGTU(totalDecrypted)}
                {allDecrypted || (
                    <>
                        {' '}
                        +{' '}
                        <ShieldImage
                            className={styles.blueShield}
                            height="30"
                        />
                    </>
                )}
            </h1>
        </>
    );
}

const getDelegationTargetId = (dt: DelegationTarget) =>
    dt.delegateType === DelegationTargetType.Baker
        ? dt.bakerId.toString()
        : 'L-pool';

interface PublicInfoProps {
    accountInfo: AccountInfo | undefined;
}

function PublicInfo({ accountInfo }: PublicInfoProps) {
    const accountBaker =
        accountInfo !== undefined && isBakerAccount(accountInfo)
            ? accountInfo.accountBaker
            : undefined;
    const accountDelegation =
        accountInfo !== undefined && isDelegatorAccount(accountInfo)
            ? accountInfo.accountDelegation
            : undefined;

    const { total, staked, atDisposal } = getPublicAccountAmounts(accountInfo);

    return (
        <>
            <h1 className={clsx(styles.blueText, 'mV20')}>
                {displayAsGTU(total)}
            </h1>
            <div className={styles.details}>
                <SidedRow
                    className={clsx(styles.amountRow, 'mT0')}
                    left={<span className="mR5">At disposal:</span>}
                    right={displayAsGTU(atDisposal)}
                />
                <SidedRow
                    className={clsx(styles.amountRow, 'mB0')}
                    left={<span className="mR5">Staked:</span>}
                    right={displayAsGTU(staked)}
                />
            </div>
            {(accountBaker === undefined &&
                accountDelegation === undefined) || (
                <div className={styles.bakerRow}>
                    <BakerImage className={styles.bakerImage} height="18" />
                    <h3 className="m0">
                        {accountBaker !== undefined &&
                            `Baking: ${accountBaker.bakerId}`}
                        {accountDelegation !== undefined &&
                            `Delegating: ${getDelegationTargetId(
                                accountDelegation.delegationTarget
                            )}`}
                    </h3>
                </div>
            )}
        </>
    );
}

/**
 * Displays the chosen Account's balance, and contains
 * buttons to toggle whether viewing shielded or unshielded balance/transactions.
 */
export default function AccountBalanceView(): JSX.Element | null {
    const dispatch = useDispatch();
    const accounts = useSelector(accountsSelector);
    const account = useSelector(chosenAccountSelector);
    const accountInfo = useSelector(chosenAccountInfoSelector);
    const viewingShielded = useSelector(viewingShieldedSelector);

    if (!account) {
        return null; // TODO: add display for pending account (which have no accountinfo)
    }

    const isMultiSig =
        Object.values(accountInfo?.accountCredentials ?? {}).length > 1;
    const canChangeAccount = accounts.length > 1;

    if (isMultiSig && viewingShielded) {
        setViewingShieldedAndReset(dispatch, false);
    }

    return (
        <Card className={styles.accountBalanceView} dark>
            <div
                className={clsx(
                    styles.accountNameWrapper,
                    canChangeAccount && 'justifySpaceBetween'
                )}
            >
                {canChangeAccount && (
                    <Button
                        clear
                        onClick={() => dispatch(previousConfirmedAccount())}
                    >
                        <ArrowIcon className={styles.prevAccountIcon} />
                    </Button>
                )}
                <AccountName name={account.name} address={account.address} />
                {canChangeAccount && (
                    <Button
                        clear
                        onClick={() => dispatch(nextConfirmedAccount())}
                    >
                        <ArrowIcon className={styles.nextAccountIcon} />
                    </Button>
                )}
            </div>
            <div
                className={clsx(
                    styles.viewingShielded,
                    isMultiSig && 'justifyCenter'
                )}
            >
                <Button
                    clear
                    disabled={!viewingShielded}
                    className={clsx(
                        styles.viewingShieldedButton,
                        !viewingShielded && styles.active
                    )}
                    onClick={() => setViewingShieldedAndReset(dispatch, false)}
                >
                    Balance
                </Button>
                {!isMultiSig && (
                    <Button
                        clear
                        disabled={viewingShielded}
                        className={clsx(
                            styles.viewingShieldedButton,
                            viewingShielded && styles.active
                        )}
                        onClick={() =>
                            setViewingShieldedAndReset(dispatch, true)
                        }
                    >
                        Shielded balance
                    </Button>
                )}
            </div>
            {viewingShielded ? (
                <ShieldedInfo account={account} />
            ) : (
                <PublicInfo accountInfo={accountInfo} />
            )}
            <AccountDefaultButton
                account={account}
                className={styles.defaultButton}
            />
        </Card>
    );
}
