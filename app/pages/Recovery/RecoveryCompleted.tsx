import React from 'react';
import { push } from 'connected-react-router';
import { useDispatch } from 'react-redux';
import routes from '~/constants/routes.json';
import Button from '~/cross-app-components/Button';
import { Account, StateUpdate } from '~/utils/types';

import styles from './Recovery.module.scss';

interface Props {
    setRecoveredAccounts: StateUpdate<Account[][]>;
}

/**
 * Column, which is displayed after the recovery has finished.
 */
export default function RecoveryCompleted({ setRecoveredAccounts }: Props) {
    const dispatch = useDispatch();

    return (
        <>
            <p>
                These are the recovered accounts. If it looks correct, you can
                go to the Accounts page and edit their names.
            </p>
            <p>
                As identities are not recoverable, there will be shown
                placeholder cards in the Identities page. These can also have
                their names edited, but they cannot be used to create new
                accounts. If you need more accounts, you can always create a new
                identity.
            </p>
            <p>
                If you are still missing some accounts, you can go back and look
                for more.
            </p>
            <Button
                className={styles.topButton}
                onClick={() => {
                    setRecoveredAccounts([]);
                    dispatch(push(routes.RECOVERY_MAIN));
                }}
            >
                Go back and look for more
            </Button>
            <Button
                className={styles.button}
                onClick={() => dispatch(push(routes.ACCOUNTS))}
            >
                Go to accounts
            </Button>
        </>
    );
}
