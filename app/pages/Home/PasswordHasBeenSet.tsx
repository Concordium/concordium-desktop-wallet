import { push } from 'connected-react-router';
import React from 'react';
import { useDispatch } from 'react-redux';
import PageLayout from '~/components/PageLayout/PageLayout';
import Button from '~/cross-app-components/Button';
import routes from '../../constants/routes.json';
import styles from './Home.module.scss';

export default function PasswordHasBeenSet() {
    const dispatch = useDispatch();

    return (
        <PageLayout.Container disableBack>
            <div className={styles.content}>
                <div>
                    <h2 className={styles.title}>Wallet password created!</h2>
                    <p>
                        Your wallet password has been set! Please remember to
                        keep it safe, as you will need it later if you want to
                        reset it. Lost passwords cannot be recreated or reset.
                    </p>
                </div>
                <Button
                    onClick={() =>
                        dispatch(push({ pathname: routes.ACCOUNTS }))
                    }
                >
                    Continue to the application
                </Button>
            </div>
        </PageLayout.Container>
    );
}
