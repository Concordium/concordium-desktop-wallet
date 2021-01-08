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

    const buttons = (
        <div className={styles.line}>
            <button
                className={styles.buttonAsText}
                disabled={!viewingShielded}
                type="button"
                onClick={() => viewShielded(false)}
            >
                Balance
            </button>
            <button
                className={styles.buttonAsText}
                disabled={viewingShielded}
                type="button"
                onClick={() => viewShielded(true)}
            >
                Shielded Balance
            </button>
        </div>
    );

    let main;
    if (viewingShielded) {
        main = <h1>{accountInfo.accountEncryptedAmount.selfAmount}</h1>;
    } else {
        main = (
            <>
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
                    <p className={styles.rightAlignedText}>
                        {' '}
                        {fromMicroUnits(0)}{' '}
                    </p>
                </div>
            </>
        );
    }

    return (
        <div className={styles.accountBalanceView}>
            {buttons}
            {main}
        </div>
    );
}
