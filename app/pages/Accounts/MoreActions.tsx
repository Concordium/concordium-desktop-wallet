import React from 'react';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import { Switch, Route, Link } from 'react-router-dom';
import { Menu, Button } from 'semantic-ui-react';
import { Account, AccountInfo } from '../../utils/types';
import routes from '../../constants/routes.json';
import ShowAccountAddress from './ShowAccountAddress';
import ShowReleaseSchedule from './ShowReleaseSchedule';
import ScheduleTransfer from './ScheduleTransfer';
import ExportTransactions from './ExportTransactions';
import CredentialInformation from './CredentialInformation';

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
 * TODO: Find a better name?
 */
export default function MoreActions({ account, accountInfo }: Props) {
    const dispatch = useDispatch();

    function MoreActionsMenu() {
        return (
            <>
                <Button as={Link} to={routes.ACCOUNTS}>
                    x
                </Button>
                <Menu vertical>
                    {items.map((item) => (
                        <Menu.Item
                            onClick={() => dispatch(push(item.location))}
                            key={item.location}
                        >
                            {item.name}
                        </Menu.Item>
                    ))}
                </Menu>
            </>
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
