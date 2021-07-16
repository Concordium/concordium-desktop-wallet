import React, { useState } from 'react';
import { Switch, Route } from 'react-router-dom';
import { push } from 'connected-react-router';
import { useDispatch } from 'react-redux';
import Columns from '~/components/Columns';
import SimpleErrorModal from '~/components/SimpleErrorModal';
import routes from '~/constants/routes.json';
import { Account } from '~/utils/types';
import PerformRecovery from './PerformRecovery';
import RecoveryCompleted from './RecoveryCompleted';
import DisplayRecovery from './DisplayRecovery';
import { Status } from './util';

import styles from './Recovery.module.scss';

/**
 * Component to run the account recovery algorithm.
 */
export default function Recovery() {
    const dispatch = useDispatch();
    const [error, setError] = useState<string>();
    const [status, setStatus] = useState<Status | undefined>(Status.initial);
    const [recoveredAccounts, setRecoveredAccounts] = useState<Account[][]>([]);

    return (
        <>
            <SimpleErrorModal
                header="Unable to recover credentials"
                content={error}
                show={Boolean(error)}
                onClick={() => dispatch(push(routes.IDENTITIES))}
            />
            <Columns className="flexChildFill" columnScroll>
                <Columns.Column>
                    <div className={styles.leftColumn}>
                        <h2 className="mB40 textLeft">Account Recovery</h2>
                        <Switch>
                            <Route
                                path={routes.RECOVERY_COMPLETED}
                                render={() => (
                                    <RecoveryCompleted
                                        setRecoveredAccounts={
                                            setRecoveredAccounts
                                        }
                                    />
                                )}
                            />
                            <Route
                                render={() => (
                                    <PerformRecovery
                                        setRecoveredAccounts={
                                            setRecoveredAccounts
                                        }
                                        setError={setError}
                                        setStatus={setStatus}
                                    />
                                )}
                            />
                        </Switch>
                    </div>
                </Columns.Column>
                <Columns.Column>
                    <DisplayRecovery
                        status={status}
                        recoveredAccounts={recoveredAccounts}
                    />
                </Columns.Column>
            </Columns>
        </>
    );
}
