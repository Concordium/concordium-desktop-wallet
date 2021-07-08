import { push } from 'connected-react-router';
import React from 'react';
import { useDispatch } from 'react-redux';
import clsx from 'clsx';
import PageLayout from '~/components/PageLayout';
import Button from '~/cross-app-components/Button';
import routes from '~/constants/routes.json';

import styles from './Home.module.scss';

export default function PasswordHasBeenSet() {
    const dispatch = useDispatch();

    return (
        <PageLayout.Container className="pB0" disableBack padding="both">
            <div className={styles.content}>
                <h2>Wallet password created!</h2>
                <div>
                    <p>Your wallet password has been set!</p>
                    <p>
                        Please remember to keep it safe, as you will need it
                        later if you want to reset it. Lost passwords cannot be
                        recreated or reset.
                    </p>
                </div>
                <Button
                    className={clsx(styles.button, 'mT100')}
                    onClick={() =>
                        dispatch(push({ pathname: routes.HOME_NODE_CONNECT }))
                    }
                >
                    Continue to the application
                </Button>
            </div>
        </PageLayout.Container>
    );
}
