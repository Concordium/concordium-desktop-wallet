import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import { Switch, Route } from 'react-router-dom';
import { Account, AccountInfo, TransactionKindId } from '../../utils/types';
import routes from '../../constants/routes.json';
import ShowAccountAddress from './ShowAccountAddress';
import ShowReleaseSchedule from './ShowReleaseSchedule';
import ScheduleTransfer from './ScheduleTransfer';
import TransferLogFilters from './TransferLogFilters';
import CredentialInformation from './CredentialInformation';
import CloseButton from '~/cross-app-components/CloseButton';
import Card from '~/cross-app-components/Card';
import ButtonNavLink from '~/components/ButtonNavLink';
import { accountHasDeployedCredentialsSelector } from '~/features/CredentialSlice';
import { createTransferWithAccountPathName } from '~/utils/accountRouterHelpers';
import { hasEncryptedBalance } from '~/utils/accountHelpers';

import styles from './Accounts.module.scss';

interface Props {
    account: Account;
    accountInfo: AccountInfo;
}

interface MoreActionObject {
    name: string;
    location: string;
    isDisabled?: (
        hasCredential: boolean,
        usedEncrypted: boolean,
        isBaker: boolean,
        bakerCooldown: boolean
    ) => boolean;
}

const items: MoreActionObject[] = [
    { name: 'Account Address', location: routes.ACCOUNTS_MORE_ADDRESS },
    {
        name: 'Inspect release schedule',
        location: routes.ACCOUNTS_MORE_INSPECTRELEASESCHEDULE,
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
    {
        name: 'Send GTU with a schedule',
        location: routes.ACCOUNTS_MORE_CREATESCHEDULEDTRANSFER,
        isDisabled: (hasCredential) => !hasCredential,
    },
    {
        name: 'Update credentials',
        location: createTransferWithAccountPathName(
            TransactionKindId.Update_credentials
        ),
        isDisabled: (hasCredential, usedEncrypted) =>
            !hasCredential || usedEncrypted,
    },
    {
        name: 'Add baker',
        location: createTransferWithAccountPathName(
            TransactionKindId.Add_baker
        ),
        isDisabled: (hasCredential, _encrypted, isBaker) =>
            !hasCredential || isBaker,
    },
    {
        name: 'Remove baker',
        location: createTransferWithAccountPathName(
            TransactionKindId.Remove_baker
        ),
        isDisabled: (hasCredential, _encrypted, isBaker, bakerCooldown) =>
            !hasCredential || !isBaker || bakerCooldown,
    },
    {
        name: 'Update baker keys',
        location: createTransferWithAccountPathName(
            TransactionKindId.Update_baker_keys
        ),
        isDisabled: (hasCredential, _encrypted, isBaker) =>
            !hasCredential || !isBaker,
    },
    {
        name: 'Update baker stake',
        location: createTransferWithAccountPathName(
            TransactionKindId.Update_baker_stake
        ),
        isDisabled: (hasCredential, _encrypted, isBaker, bakerCooldown) =>
            !hasCredential || !isBaker || bakerCooldown,
    },
    {
        name: 'Update baker restake earnings',
        location: createTransferWithAccountPathName(
            TransactionKindId.Update_baker_restake_earnings
        ),
        isDisabled: (hasCredential, _encrypted, isBaker) =>
            !hasCredential || !isBaker,
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
    const hasUsedEncrypted = hasEncryptedBalance(accountInfo);
    const hasBakerCooldown = Boolean(accountInfo?.accountBaker?.pendingChange);

    function MoreActionsMenu() {
        return (
            <Card className="relative flexColumn pH50 bgOffWhite">
                <h3 className="textCenter">More Actions</h3>
                <CloseButton
                    className={styles.closeButton}
                    onClick={() => dispatch(push(routes.ACCOUNTS))}
                />
                {items
                    .filter(
                        (item) =>
                            !(
                                item.isDisabled &&
                                item.isDisabled(
                                    accountHasDeployedCredentials,
                                    hasUsedEncrypted,
                                    Boolean(accountInfo.accountBaker),
                                    hasBakerCooldown
                                )
                            )
                    )
                    .map((item) => {
                        return (
                            <ButtonNavLink
                                to={{
                                    pathname: item.location,
                                    state: {
                                        account,
                                    },
                                }}
                                key={item.location}
                                className="h3 mV10"
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
