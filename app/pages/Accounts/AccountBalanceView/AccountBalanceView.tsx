import React from 'react';
import clsx from 'clsx';
import { useDispatch, useSelector } from 'react-redux';
import ShieldImage from '@resources/svg/shield.svg';
import BakerImage from '@resources/svg/baker.svg';
import ArrowIcon from '@resources/svg/back-arrow.svg';
import Button from '~/cross-app-components/Button';
import Card from '~/cross-app-components/Card';
import { displayAsGTU } from '~/utils/gtu';
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

    const buttons = (
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
                    onClick={() => setViewingShieldedAndReset(dispatch, true)}
                >
                    Shielded Balance
                </Button>
            )}
        </div>
    );

    let main;
    if (viewingShielded) {
        const totalDecrypted = account.totalDecrypted || 0n;

        main = (
            <>
                <ShieldImage className={styles.backgroundImage} />
                <h1 className={clsx(styles.shieldedAmount, 'mV20')}>
                    {displayAsGTU(totalDecrypted)}
                    {account.allDecrypted || (
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
    } else {
        const accountBaker = accountInfo?.accountBaker;
        const { total, staked, atDisposal } = getPublicAccountAmounts(
            accountInfo
        );

        main = (
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
                {accountBaker && (
                    <div className={styles.bakerRow}>
                        <BakerImage className={styles.bakerImage} height="18" />
                        <h3 className="m0">
                            {accountBaker.bakerId.toString()}
                        </h3>
                    </div>
                )}
            </>
        );
    }

    return (
        <Card className={styles.accountBalanceView}>
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
            {buttons}
            {main}
            <AccountDefaultButton
                account={account}
                className={styles.defaultButton}
            />
        </Card>
    );
}
