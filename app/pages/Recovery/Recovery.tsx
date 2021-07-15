import React, { useState } from 'react';
import { Switch, Route } from 'react-router-dom';
import { push } from 'connected-react-router';
import { useDispatch } from 'react-redux';
import Columns from '~/components/Columns';
import SimpleErrorModal from '~/components/SimpleErrorModal';
import routes from '~/constants/routes.json';
import { Account } from '~/utils/types';
import Button from '~/cross-app-components/Button';
import AccountCard from '~/components/AccountCard';
import CardList from '~/cross-app-components/CardList';
import PerformRecovery from './PerformRecovery';

import styles from './Recovery.module.scss';

/**
 * Component to run the account recovery algorithm.
 */
export default function Recovery() {
    const dispatch = useDispatch();
    const [error, setError] = useState<string>();
    const [recoveredAccounts, setRecoveredAccounts] = useState<Account[][]>([]);

    return (
        <>
            <SimpleErrorModal
                header="Unable to recover credentials"
                content={error}
                show={Boolean(error)}
                onClick={() => dispatch(push(routes.IDENTITIES))}
            />
            <Columns className="flexChildFill">
                <Columns.Column>
                    <div className={styles.leftColumn}>
                        <h2 className="mB40 textLeft">Account Recovery</h2>
                        <Switch>
                            <Route
                                path={routes.RECOVERY_COMPLETED}
                                render={() => (
                                    <>
                                        <p>
                                            These are the recovered accounts. If
                                            it looks correct, you can go to the
                                            Accounts page and edit their names.
                                            As identities are not recoverable,
                                            there will be shown placeholder
                                            cards in the Identities page. These
                                            can also have their names edited,
                                            but they cannot be used to create
                                            new accounts. If you need more
                                            accounts, you can always create a
                                            new identity. If you are still
                                            missing some accounts, you can go
                                            back and look for more.
                                        </p>
                                        <Button
                                            className={styles.topButton}
                                            onClick={() => {
                                                setRecoveredAccounts([]);
                                                dispatch(
                                                    push(routes.RECOVERY_MAIN)
                                                );
                                            }}
                                        >
                                            Go back and look for more
                                        </Button>
                                        <Button
                                            className={styles.button}
                                            onClick={() =>
                                                dispatch(push(routes.ACCOUNTS))
                                            }
                                        >
                                            Go to accounts
                                        </Button>
                                    </>
                                )}
                            />
                            <Route
                                render={() => (
                                    <PerformRecovery
                                        setRecoveredAccounts={
                                            setRecoveredAccounts
                                        }
                                        setError={setError}
                                    />
                                )}
                            />
                        </Switch>
                    </div>
                </Columns.Column>
                <Columns.Column>
                    <div className={styles.messages}>
                        {recoveredAccounts.map((accounts, index) => (
                            <>
                                <p className="bodyEmphasized textLeft">
                                    Index {index}:
                                </p>
                                <p className="textLeft">
                                    Done: Found {accounts.length} account
                                    {accounts.length === 1 || 's'}.
                                </p>
                                <CardList>
                                    {accounts.map((account) => (
                                        <AccountCard
                                            key={account.address}
                                            account={account}
                                        />
                                    ))}
                                </CardList>
                            </>
                        ))}
                        <p className="bodyEmphasized textLeft">
                            Index {recoveredAccounts.length}:
                        </p>
                        <p className="textLeft">Waiting...</p>
                    </div>
                </Columns.Column>
            </Columns>
        </>
    );
}
