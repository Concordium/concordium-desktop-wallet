import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './Accounts.css';
import { fromMicroUnits } from '../utils/transactionHelpers';
import { Account, AccountInfo } from '../utils/types';
import {
    setViewingShielded,
    viewingShieldedSelector,
} from '../features/TransactionSlice';

interface Props {
    account: Account;
    accountInfo: AccountInfo;
}

export default function AccountBalanceView({ account, accountInfo }: Props) {
    const dispatch = useDispatch();
    const viewingShielded = useSelector(viewingShieldedSelector);

    if (!accountInfo) {
        return <div className={styles.accountBalanceView} />;
    }

    const buttons = (
        <div className={styles.line}>
            <button
                className={styles.buttonAsText}
                disabled={!viewingShielded}
                type="button"
                onClick={() => dispatch(setViewingShielded(false))}
            >
                Balance
            </button>
            <button
                className={styles.buttonAsText}
                disabled={viewingShielded}
                type="button"
                onClick={() => dispatch(setViewingShielded(true))}
            >
                Shielded Balance
            </button>
        </div>
    );

    let main;
    if (viewingShielded) {
        main = (
            <h1>
                {fromMicroUnits(account.totalDecrypted)}{' '}
                {account.allDecrypted ? '' : ' + ?'}
            </h1>
        );
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
