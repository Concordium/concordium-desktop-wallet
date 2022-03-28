import React from 'react';
import clsx from 'clsx';
import { useDispatch, useSelector } from 'react-redux';
import ShieldImage from '@resources/svg/shield.svg';
import type { DelegationTarget } from '@concordium/node-sdk';
import {
    isBakerAccount,
    isDelegatorAccount,
} from '@concordium/node-sdk/lib/src/accountHelpers';
import { DelegationTargetType } from '@concordium/node-sdk/lib/src/types';
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
            <h1 className={clsx(styles.shieldedAmount, 'mV20')}>
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
            </h1>
        </>
    );
}

const getDelegationTargetId = (dt: DelegationTarget) =>
    dt.delegateType === DelegationTargetType.Baker
        ? `baker ${dt.bakerId}`
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
                {displayAsCcd(total)}
            </h1>
            <div className={styles.details}>
                <div className="mB20">
                    <Label className="mB5 textWhite">At disposal:</Label>
                    <span className="body2 textBlue">
                        {displayAsCcd(atDisposal)}
                    </span>
                </div>
                {(accountBaker !== undefined ||
                    accountDelegation !== undefined) && (
                    <div className="mB20">
                        <Label className="mB5 textWhite">
                            {accountBaker !== undefined &&
                                `Staked for baking: ${accountBaker.bakerId}`}
                            {accountDelegation !== undefined &&
                                `Delegating to ${getDelegationTargetId(
                                    accountDelegation.delegationTarget
                                )}:`}
                        </Label>
                        <span className="body2 textBlue">
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
