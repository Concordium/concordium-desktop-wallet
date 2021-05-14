import React, { useState } from 'react';
import { Route, RouteComponentProps, Switch } from 'react-router';
import Button from '~/cross-app-components/Button';
import routes from '~/constants/routes.json';
import ExportCredential from '../ExportCredential';

import generalStyles from '../GenerateCredential.module.scss';
import styles from './SingleColumnRouter.module.scss';

function getHeader(currentLocation: string) {
    switch (currentLocation) {
        case routes.GENERATE_CREDENTIAL_EXPORT:
            return 'Export your credentials';
        default:
            return '';
    }
}

function getDescription(currentLocation: string) {
    switch (currentLocation) {
        case routes.GENERATE_CREDENTIAL_EXPORT:
            return 'The last step is to export and send your credentials to the proposing owner of the account. They will then be able to propose you as a new owner of the account.';
        default:
            return '';
    }
}

interface Props extends RouteComponentProps {
    onNext(): void;
}

export default function SingleColumnRouter({
    onNext,
    location,
}: Props): JSX.Element {
    const [canContinue, setCanContinue] = useState(false);

    return (
        <div className={styles.root}>
            <div>
                <h2 className={styles.header}>
                    {getHeader(location.pathname)}
                </h2>
                <p className={styles.description}>
                    {getDescription(location.pathname)}
                </p>
                <Switch>
                    <Route>
                        <ExportCredential onExported={setCanContinue} />
                    </Route>
                </Switch>
            </div>
            <Button
                className={generalStyles.continueButton}
                disabled={!canContinue}
                onClick={() => onNext()}
            >
                Finish
            </Button>
        </div>
    );
}
