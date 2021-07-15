import React from 'react';
import { Switch, Route } from 'react-router-dom';
import routes from '~/constants/routes.json';
import PageLayout from '~/components/PageLayout';
import Recovery from './Recovery';
import RecoveryIntroduction from './RecoveryIntroduction';

export default function RecoveryPage() {
    return (
        <PageLayout>
            <PageLayout.Header>
                <h1>Recovery</h1>
            </PageLayout.Header>
            <PageLayout.Container padding="vertical" className="flexColumn">
                <Switch>
                    <Route
                        exact
                        path={routes.RECOVERY}
                        component={RecoveryIntroduction}
                    />
                    <Route component={Recovery} />
                </Switch>
            </PageLayout.Container>
        </PageLayout>
    );
}
