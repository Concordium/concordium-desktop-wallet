import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ArrowIcon from '@resources/svg/back-arrow.svg';
import Button from '~/cross-app-components/Button';
import {
    accountsSelector,
    nextConfirmedAccount,
    previousConfirmedAccount,
} from '~/features/AccountSlice';
import AccountBalanceView from '../../AccountBalanceView';

import styles from './AccountCarousel.module.scss';

export default function AccountCarousel() {
    const accounts = useSelector(accountsSelector);
    const dispatch = useDispatch();
    const canChangeAccount = accounts.length > 1;

    return (
        <div className={styles.root}>
            <Button
                className={styles.prev}
                clear
                onClick={() => dispatch(previousConfirmedAccount())}
                disabled={!canChangeAccount}
            >
                <ArrowIcon className={styles.icon} />
            </Button>
            <AccountBalanceView />
            <Button
                className={styles.next}
                clear
                onClick={() => dispatch(nextConfirmedAccount())}
                disabled={!canChangeAccount}
            >
                <ArrowIcon className={styles.icon} />
            </Button>
        </div>
    );
}
