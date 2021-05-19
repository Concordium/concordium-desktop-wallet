import { push } from 'connected-react-router';
import React from 'react';
import { useDispatch } from 'react-redux';
import PageLayout from '~/components/PageLayout';
import Button from '~/cross-app-components/Button';
import routes from '~/constants/routes.json';

import homeStyles from '../Home.module.scss';
import styles from './NewUserInit.module.scss';

export default function NewUserInit() {
    const dispatch = useDispatch();

    return (
        <PageLayout.Container disableBack>
            <div className={styles.content}>
                <div className="flexChildFill flexColumn justifyCenter">
                    <h2 className="mB50">Hi, there!</h2>
                    <p>
                        Before you can start using the Concordium Desktop
                        Wallet, you have to set up a few security measures.
                        Press Continue to be guided through the setup process.
                    </p>
                </div>
                <Button
                    className={homeStyles.button}
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
        </PageLayout.Container>
    );
}
