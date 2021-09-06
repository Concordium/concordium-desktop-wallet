import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Switch, Route } from 'react-router-dom';
import Columns from '~/components/Columns';
import { loadAccounts } from '~/features/AccountSlice';
import { loadAddressBook } from '~/features/AddressBookSlice';
import { loadIdentities } from '~/features/IdentitySlice';
import routes from '~/constants/routes.json';
import { Account } from '~/utils/types';
import PerformRecovery from './PerformRecovery';
import RecoveryCompleted from './RecoveryCompleted';
import DisplayRecovery from './DisplayRecovery';
import { Status } from './util';

import styles from './Recovery.module.scss';

/**
 * Main Component for the account recovery algorithm.
 */
export default function Recovery() {
    const dispatch = useDispatch();
    const [status, setStatus] = useState<Status | undefined>(Status.Initial);
    const [recoveredAccounts, setRecoveredAccounts] = useState<Account[][]>([]);
    const [currentIdentityNumber, setCurrentIdentityNumber] = useState<number>(
        0
    );

    useEffect(() => {
        return () => {
            loadAccounts(dispatch);
            loadIdentities(dispatch);
            loadAddressBook(dispatch);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Columns className="flexChildFill" columnScroll>
            <Columns.Column>
                <div className={styles.leftColumn}>
                    <h2 className="mB40 textLeft">Account Recovery</h2>
                    <Switch>
                        <Route
                            path={routes.RECOVERY_COMPLETED}
                            render={() => <RecoveryCompleted />}
                        />
                        <Route
                            render={() => (
                                <PerformRecovery
                                    setRecoveredAccounts={setRecoveredAccounts}
                                    setCurrentIdentityNumber={
                                        setCurrentIdentityNumber
                                    }
                                    currentIdentityNumber={
                                        currentIdentityNumber
                                    }
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
    );
}
