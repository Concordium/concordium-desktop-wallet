import React from 'react';
import clsx from 'clsx';
import { useDispatch, useSelector } from 'react-redux';
import ShieldImage from '@resources/svg/shield.svg';
import type { DelegationTarget } from '@concordium/web-sdk';
import {
    isBakerAccount,
    isDelegatorAccount,
    DelegationTargetType,
} from '@concordium/web-sdk';

import Button from '~/cross-app-components/Button';
import Card from '~/cross-app-components/Card';
import { Account, AccountInfo } from '~/utils/types';
import { displayAsCcd } from '~/utils/ccd';
import {
    setViewingShieldedAndReset,
    viewingShieldedSelector,
} from '~/features/TransactionSlice';
import {
    chosenAccountSelector,
    chosenAccountInfoSelector,
} from '~/features/AccountSlice';
import AccountName from './AccountName';
import AccountDefaultButton from './AccountDefaultButton';
import { getPublicAccountAmounts } from '~/utils/accountHelpers';
import Label from '~/components/Label';

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
            <div className={clsx(styles.shieldedAmount, 'mB10')}>
                <Label className="mB5 textWhite">Shielded balance total</Label>
                <span className="body1 textBlue mono">
                    {displayAsCcd(totalDecrypted)}
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
                </span>
            </div>
        </>
    );
}

const getDelegationTargetId = (dt: DelegationTarget) =>
    dt.delegateType === DelegationTargetType.Baker
        ? `Delegation to staking pool ${dt.bakerId}`
        : 'Passive delegation';

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
            <div className={styles.details}>
                <div className="mB10">
                    <Label className="mB5 textWhite">Balance total</Label>
                    <span className="body1 textBlue mono">
                        {displayAsCcd(total)}
                    </span>
                </div>
                <div className="mB10">
                    <Label className="mB5 textWhite">At disposal</Label>
                    <span className="body2 textBlue mono">
                        {displayAsCcd(atDisposal)}
                    </span>
                </div>
                {(accountBaker !== undefined ||
                    accountDelegation !== undefined) && (
                    <div className="mB10">
                        <Label className="mB5 textWhite">
                            {accountBaker !== undefined &&
                                `Stake with validator ${accountBaker.bakerId}`}
                            {accountDelegation !== undefined &&
                                getDelegationTargetId(
                                    accountDelegation.delegationTarget
                                )}
                        </Label>
                        <span className="body2 textBlue mono">
                            {displayAsCcd(staked)}
                        </span>
                    </div>
                )}
            </div>
        </>
    );
}

/**
 * Displays the chosen Account's balance, and contains
 * buttons to toggle whether viewing shielded or unshielded balance/transactions.
 */
export default function AccountBalanceView(): JSX.Element | null {
    const dispatch = useDispatch();
    const account = useSelector(chosenAccountSelector);
    const accountInfo = useSelector(chosenAccountInfoSelector);
    const viewingShielded = useSelector(viewingShieldedSelector);

    if (!account) {
        return null; // TODO: add display for pending account (which have no accountinfo)
    }

    const isMultiSig =
        Object.values(accountInfo?.accountCredentials ?? {}).length > 1;

    if (isMultiSig && viewingShielded) {
        setViewingShieldedAndReset(dispatch, false);
    }

    return (
        <Card className={styles.accountBalanceView} dark>
            <div className={styles.accountNameWrapper}>
                <AccountName name={account.name} address={account.address} />
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
            {isMultiSig || (
                <div className={styles.viewingShielded}>
                    <Button
                        clear
                        disabled={!viewingShielded}
                        className={clsx(
                            styles.viewingShieldedButton,
                            !viewingShielded && styles.active
                        )}
                        onClick={() =>
                            setViewingShieldedAndReset(dispatch, false)
                        }
                    >
                        Balance
                    </Button>
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
                </div>
            )}
        </Card>
    );
}
