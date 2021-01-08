import React from 'react';
import styles from './Accounts.css';
import { fromMicroUnits } from '../utils/transactionHelpers';
import { AccountInfo } from '../utils/types';

interface Props {
    accountInfo: AccountInfo;
    viewingShielded: boolean;
    viewShielded: (isViewing: boolean) => void;
}

export default function AccountBalanceView({
    accountInfo,
    viewingShielded,
    viewShielded,
}: Props) {
    if (!accountInfo) {
        return <div className={styles.accountBalanceView} />;
    }

    return (
        <div className={styles.accountBalanceView}>
            <div className={styles.line}>
                <button
                    disabled={!viewingShielded}
                    type="button"
                    onClick={() => viewShielded(false)}
                >
                    Balance
                </button>
                <button
                    disabled={viewingShielded}
                    type="button"
                    onClick={() => viewShielded(true)}
                >
                    Shielded Balance
                </button>
            </div>

            <h1>{fromMicroUnits(accountInfo.accountAmount)}</h1>
            <div className={styles.line}>
                <p className={styles.leftAlignedText}> At disposal: </p>
                <p className={styles.rightAlignedText}>
                    {fromMicroUnits(
                        parseInt(accountInfo.accountAmount, 10) -
                            parseInt(
                                accountInfo.accountReleaseSchedule.total,
                                10
                            )
                    )}{' '}
                </p>
            </div>
            <br />
            <div className={styles.line}>
                <p className={styles.leftAlignedText}> Staked: </p>
                <p className={styles.rightAlignedText}> {fromMicroUnits(0)} </p>
            </div>
        </div>
    );
}
