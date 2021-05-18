import { push } from 'connected-react-router';
import React from 'react';
import { useDispatch } from 'react-redux';
import PageLayout from '~/components/PageLayout/PageLayout';
import Button from '~/cross-app-components/Button/Button';
import routes from '../../constants/routes.json';
import styles from './Home.module.scss';

export default function NewUserInit() {
    const dispatch = useDispatch();

    return (
        <PageLayout.Container disableBack>
            <div className={styles.content}>
                <div>
                    <div>
                        <h2 className={styles.title}>Hi, there!</h2>
                        <p>
                            Before you can start using the Concordium Desktop
                            Wallet, you have to set up a few security measures.
                            Press Continue to be guided through the setup
                            process.
                        </p>
                    </div>
                    <Button
                        onClick={() =>
                            dispatch(
                                push({
                                    pathname: routes.HOME_SELECT_PASSWORD,
                                })
                            )
                        }
                    >
                        Continue
                    </Button>
                </div>
            </div>
        </PageLayout.Container>
    );
}
