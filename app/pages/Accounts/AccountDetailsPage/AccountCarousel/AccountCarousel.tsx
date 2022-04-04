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
            {canChangeAccount && (
                <Button
                    className={styles.prev}
                    clear
                    onClick={() => dispatch(previousConfirmedAccount())}
                >
                    <ArrowIcon className={styles.icon} />
                </Button>
            )}
            <AccountBalanceView />
            {canChangeAccount && (
                <Button
                    className={styles.next}
                    clear
                    onClick={() => dispatch(nextConfirmedAccount())}
                >
                    <ArrowIcon className={styles.icon} />
                </Button>
            )}
        </div>
    );
}
