import React from 'react';
import { push } from 'connected-react-router';
import { useDispatch } from 'react-redux';
import routes from '~/constants/routes.json';
import Button from '~/cross-app-components/Button';

import styles from './Recovery.module.scss';

/**
 * Displays information about the recovery.
 */
export default function RecoveryIntroduction() {
    const dispatch = useDispatch();

    return (
        <div className={styles.introduction}>
            <h2>Account recovery</h2>
            <p>
                You can recover your lost accounts using a Ledger device that
                has been set up using the same seed phrase, as the Ledger used
                to create the accounts originally. Lost identities cannot be
                recovered, as the identity object is not stored on the Ledger.
                Instead you can go through each index on the Ledger where the
                data to create credentials are stored, which can then be used to
                regain access to the accounts related to the given
                identity/index.
            </p>
            <p>
                This means that you have to allow the Desktop Wallet to access
                the data used to create the credentials, for each identity
                index, on the Ledger device, to allow the Desktop Wallet to look
                for your lost accounts. There might be “empty” indices from
                failed identity creations, which means you might have to go past
                a few indices with no accounts.
            </p>
            <p>
                When you think you have found all your accounts, you can stop
                the process.
            </p>
            <p>
                Accounts recovered during this process will not have the names
                orignally given to them, and instead the name will show the
                first eight digits of the account address. You will later be
                able to rename the account in your wallet, for easier
                recognition.
            </p>
            <Button
                className={styles.introductionButton}
                onClick={() => dispatch(push(routes.RECOVERY_MAIN))}
            >
                Continue
            </Button>
        </div>
    );
}
