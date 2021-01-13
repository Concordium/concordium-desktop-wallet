import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './Accounts.css';
import { fromMicroUnits } from '../utils/transactionHelpers';
import {
    setViewingShielded,
    viewingShieldedSelector,
} from '../features/TransactionSlice';
import {
    chosenAccountSelector,
    chosenAccountInfoSelector,
} from '../features/AccountSlice';

export default function AccountBalanceView() {
    const dispatch = useDispatch();
    const account = useSelector(chosenAccountSelector);
    const accountInfo = useSelector(chosenAccountInfoSelector);

    const viewingShielded = useSelector(viewingShieldedSelector);

    if (!account || !accountInfo) {
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
