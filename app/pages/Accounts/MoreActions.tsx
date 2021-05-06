import React from 'react';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import { Switch, Route } from 'react-router-dom';
import { Account, AccountInfo } from '../../utils/types';
import routes from '../../constants/routes.json';
import ShowAccountAddress from './ShowAccountAddress';
import ShowReleaseSchedule from './ShowReleaseSchedule';
import ScheduleTransfer from './ScheduleTransfer';
import ExportTransactions from './ExportTransactions';
import CredentialInformation from './CredentialInformation';
import CloseButton from '~/cross-app-components/CloseButton';
import Card from '~/cross-app-components/Card';
import ButtonNavLink from '~/components/ButtonNavLink';
import styles from './Accounts.module.scss';

interface Props {
    account: Account;
    accountInfo: AccountInfo;
}

const items = [
    { name: 'Account Address', location: routes.ACCOUNTS_MORE_ADDRESS },
    {
        name: 'Inspect release schedule',
        location: routes.ACCOUNTS_MORE_INSPECTRELEASESCHEDULE,
    },
    {
        name: 'Send funds with a release schedule',
        location: routes.ACCOUNTS_MORE_CREATESCHEDULEDTRANSFER,
    },
    {
        name: 'Export Transactions',
        location: routes.ACCOUNTS_MORE_EXPORT_TRANSACTIONS,
    },
    {
        name: 'Credential Information',
        location: routes.ACCOUNTS_MORE_CREDENTIAL_INFORMATION,
    },
];

/**
 * Lists additional actions, for the account.
 * And controls the flow of those actions' pages.
 */
export default function MoreActions({ account, accountInfo }: Props) {
    const dispatch = useDispatch();

    function MoreActionsMenu() {
        return (
            <Card className="relative flexColumn">
                <h3 className="textCenter">More Actions</h3>
                <CloseButton
                    className={styles.closeButton}
                    onClick={() => dispatch(push(routes.ACCOUNTS))}
                />
                {items.map((item) => (
                    <ButtonNavLink
                        to={item.location}
                        key={item.location}
                        className="h3 m10"
                    >
                        {item.name}
                    </ButtonNavLink>
                ))}
            </Card>
        );
    }
    return (
        <Switch>
            <Route
                path={routes.ACCOUNTS_MORE_ADDRESS}
                render={() => (
                    <ShowAccountAddress
                        account={account}
                        returnFunction={() =>
                            dispatch(push(routes.ACCOUNTS_MORE))
                        }
                    />
                )}
            />
            <Route
                path={routes.ACCOUNTS_MORE_INSPECTRELEASESCHEDULE}
                render={() => (
                    <ShowReleaseSchedule
                        accountInfo={accountInfo}
                        returnFunction={() =>
                            dispatch(push(routes.ACCOUNTS_MORE))
                        }
                    />
                )}
            />
            <Route
                path={routes.ACCOUNTS_MORE_CREATESCHEDULEDTRANSFER}
                render={() => (
                    <ScheduleTransfer
                        account={account}
                        returnFunction={() =>
                            dispatch(push(routes.ACCOUNTS_MORE))
                        }
                    />
                )}
            />
            <Route
                path={routes.ACCOUNTS_MORE_EXPORT_TRANSACTIONS}
                render={() => (
                    <ExportTransactions
                        account={account}
                        returnFunction={() =>
                            dispatch(push(routes.ACCOUNTS_MORE))
                        }
                    />
                )}
            />
            <Route
                path={routes.ACCOUNTS_MORE_CREDENTIAL_INFORMATION}
                render={() => (
                    <CredentialInformation
                        account={account}
                        accountInfo={accountInfo}
                        returnFunction={() =>
                            dispatch(push(routes.ACCOUNTS_MORE))
                        }
                    />
                )}
            />
            <Route component={MoreActionsMenu} />
        </Switch>
    );
}
