import React from 'react';
import clsx from 'clsx';
import { useSelector, useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import { Switch, Route } from 'react-router-dom';
import { Account, AccountInfo } from '../../utils/types';
import routes from '../../constants/routes.json';
import ShowAccountAddress from './ShowAccountAddress';
import ShowReleaseSchedule from './ShowReleaseSchedule';
import ScheduleTransfer from './ScheduleTransfer';
import TransferLogFilters from './TransferLogFilters';
import CredentialInformation from './CredentialInformation';
import CloseButton from '~/cross-app-components/CloseButton';
import Card from '~/cross-app-components/Card';
import ButtonNavLink from '~/components/ButtonNavLink';
import styles from './Accounts.module.scss';
import { accountHasDeployedCredentialsSelector } from '~/features/CredentialSlice';

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
        name: 'Send GTU with a schedule',
        location: routes.ACCOUNTS_MORE_CREATESCHEDULEDTRANSFER,
        requiresCredentials: true,
    },
    {
        name: 'Transfer Log Filters',
        location: routes.ACCOUNTS_MORE_TRANSFER_LOG_FILTERS,
    },
    {
        name: 'Make Account Report',
        location: routes.ACCOUNT_REPORT,
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
    const returnFunction = () => dispatch(push(routes.ACCOUNTS_MORE));

    const accountHasDeployedCredentials = useSelector(
        accountHasDeployedCredentialsSelector(account)
    );

    function MoreActionsMenu() {
        return (
            <Card className="relative flexColumn pH50">
                <h3 className="textCenter">More Actions</h3>
                <CloseButton
                    className={styles.closeButton}
                    onClick={() => dispatch(push(routes.ACCOUNTS))}
                />
                {items.map((item) => {
                    const isDisabled =
                        item.requiresCredentials &&
                        !accountHasDeployedCredentials;
                    return (
                        <ButtonNavLink
                            to={{
                                pathname: item.location,
                                state: account,
                            }}
                            key={item.location}
                            disabled={isDisabled}
                            className={clsx(
                                'h3 mV10',
                                isDisabled && styles.disabledAction
                            )}
                            size="big"
                        >
                            {item.name}
                        </ButtonNavLink>
                    );
                })}
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
                        returnFunction={returnFunction}
                    />
                )}
            />
            <Route
                path={routes.ACCOUNTS_MORE_INSPECTRELEASESCHEDULE}
                render={() => (
                    <ShowReleaseSchedule
                        accountInfo={accountInfo}
                        returnFunction={returnFunction}
                    />
                )}
            />
            <Route
                path={routes.ACCOUNTS_MORE_CREATESCHEDULEDTRANSFER}
                render={() => (
                    <ScheduleTransfer
                        account={account}
                        returnFunction={returnFunction}
                    />
                )}
            />
            <Route
                path={routes.ACCOUNTS_MORE_TRANSFER_LOG_FILTERS}
                render={() => (
                    <TransferLogFilters
                        account={account}
                        returnFunction={returnFunction}
                    />
                )}
            />
            <Route
                path={routes.ACCOUNTS_MORE_CREDENTIAL_INFORMATION}
                render={() => (
                    <CredentialInformation
                        account={account}
                        accountInfo={accountInfo}
                        returnFunction={returnFunction}
                    />
                )}
            />
            <Route component={MoreActionsMenu} />
        </Switch>
    );
}
