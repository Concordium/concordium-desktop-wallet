import React from 'react';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import routes from '~/constants/routes.json';
import Card from '~/cross-app-components/Card';
import Button from '~/cross-app-components/Button';

import styles from './NoIdentities.module.scss';

/**
 * Component, that will display, when there are no Identities.
 */
export default function NoIdentities() {
    const dispatch = useDispatch();

    return (
        <Card className={styles.root}>
            <h2 className="pH20">
                It looks like you don’t have an identity and initial account
                yet!
            </h2>
            <p className="mT0 pH40">
                An identity and an initial account is needed before you can
                start using the Concordium blockchain. You can either request a
                new identity and an initial account from an identity provider,
                or if you already have an identity and account, you can import
                it from a file. If you do not have a backup file, you can
                recover your accounts using the Ledger device.
            </p>
            <footer className="pH30 flex justifySpaceBetween">
                <Button
                    className={styles.button}
                    onClick={() => dispatch(push(routes.EXPORTIMPORT))}
                >
                    Import existing
                </Button>
                <Button
                    className={styles.button}
                    onClick={() => dispatch(push(routes.IDENTITYISSUANCE))}
                >
                    Request new
                </Button>
                <Button
                    className={styles.button}
                    onClick={() => dispatch(push(routes.RECOVERY))}
                >
                    Recover existing
                </Button>
            </footer>
        </Card>
    );
}
