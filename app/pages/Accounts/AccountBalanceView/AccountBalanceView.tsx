import React from 'react';
import clsx from 'clsx';
import { useDispatch, useSelector } from 'react-redux';
import ShieldImage from '@resources/svg/shield.svg';
import BakerImage from '@resources/svg/baker.svg';
import Button from '~/cross-app-components/Button';
import Card from '~/cross-app-components/Card';
import { displayAsGTU } from '~/utils/gtu';
import {
    setViewingShielded,
    viewingShieldedSelector,
} from '~/features/TransactionSlice';
import {
    chosenAccountSelector,
    chosenAccountInfoSelector,
} from '~/features/AccountSlice';
import SidedRow from '~/components/SidedRow';
import styles from './AccountBalanceView.module.scss';

/**
 * Displays the chosen Account's balance, and contains
 * buttons to toggle whether viewing shielded or unshielded balance/transactions.
 */
export default function AccountBalanceView(): JSX.Element | null {
    const dispatch = useDispatch();
    const account = useSelector(chosenAccountSelector);
    const accountInfo = useSelector(chosenAccountInfoSelector);
    const viewingShielded = useSelector(viewingShieldedSelector);

    if (!account || !accountInfo) {
        return null; // TODO: add display for pending account (which have no accountinfo)
    }

    const isMultiSig = Object.values(accountInfo.accountCredentials).length > 1;

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
                    !viewingShielded && styles.bold
                )}
                onClick={() => dispatch(setViewingShielded(false))}
            >
                Balance
            </Button>
            {!isMultiSig && (
                <Button
                    clear
                    disabled={viewingShielded}
                    className={clsx(
                        styles.viewingShieldedButton,
                        viewingShielded && styles.bold
                    )}
                    onClick={() => dispatch(setViewingShielded(true))}
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
                <h1 className={styles.shieldedAmount}>
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
        const unShielded = BigInt(accountInfo.accountAmount);
        const stakedAmount = accountBaker
            ? BigInt(accountBaker.stakedAmount)
            : 0n;
        const amountAtDisposal =
            unShielded -
            BigInt(accountInfo.accountReleaseSchedule.total) -
            stakedAmount;

        main = (
            <>
                <h1 className={styles.blueText}>{displayAsGTU(unShielded)}</h1>
                <SidedRow
                    className={styles.amountRow}
                    left="At disposal:"
                    right={displayAsGTU(amountAtDisposal)}
                />
                <SidedRow
                    className={styles.amountRow}
                    left="Staked:"
                    right={displayAsGTU(stakedAmount)}
                />
                {accountBaker && (
                    <div className={styles.bakerRow}>
                        <BakerImage className={styles.bakerImage} height="18" />
                        <h3 className="m0">{accountBaker.bakerId}</h3>
                    </div>
                )}
            </>
        );
    }

    return (
        <Card className={styles.accountBalanceView}>
            {buttons}
            {main}
        </Card>
    );
}
