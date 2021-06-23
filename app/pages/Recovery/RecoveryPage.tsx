import React, { useState } from 'react';
import { Switch, Route } from 'react-router-dom';
import routes from '~/constants/routes.json';
import PageLayout from '~/components/PageLayout';
import Recovery from './Recovery';
import RecoveryCompleted from './RecoveryCompleted';

export default function RecoveryPage() {
    const [messages, setMessages] = useState<string[]>([]);

    return (
        <PageLayout>
            <PageLayout.Header>
                <h1>Recovery</h1>
            </PageLayout.Header>
            <PageLayout.Container padding="vertical" className="flexColumn">
                <h2>Account Recovery</h2>
                <p>
                    Here you can recover the credentials and their accounts from
                    your current ledger device.
                </p>
                <Switch>
                    <Route
                        path={routes.RECOVERY_COMPLETED}
                        render={() => (
                            <RecoveryCompleted
                                messages={messages}
                                setMessages={setMessages}
                            />
                        )}
                    />
                    <Route
                        render={() => (
                            <Recovery
                                messages={messages}
                                setMessages={setMessages}
                            />
                        )}
                    />
                </Switch>
            </PageLayout.Container>
        </PageLayout>
    );
}
