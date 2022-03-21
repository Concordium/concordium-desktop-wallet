import { AccountInfo, AccountInfoDelegator } from '@concordium/node-sdk';
import { isDelegatorAccount } from '@concordium/node-sdk/lib/src/accountHelpers';
import React from 'react';
import { Redirect, Route, Switch, useLocation } from 'react-router';
import { useSelector } from 'react-redux';
import { Account } from '~/utils/types';
import routes from '~/constants/routes.json';
import ConfigureDelegation from './ConfigureDelegation';
import RemoveDelegation from './RemoveDelegation';
import ButtonNavLink from '~/components/ButtonNavLink';
import StakingDetails from '../StakingDetails';
import { hasPendingDelegationTransactionSelector } from '~/features/TransactionSlice';

interface ActionsProps {
    isDelegating: boolean;
    disabled: boolean;
}

function Actions({ isDelegating, disabled }: ActionsProps) {
    return (
        <>
            <ButtonNavLink
                className="mB20:notLast flex width100"
                to={routes.ACCOUNTS_CONFIGURE_DELEGATION}
                disabled={disabled}
            >
                Update current delegation
            </ButtonNavLink>
            {isDelegating && (
                <ButtonNavLink
                    className="flex width100"
                    to={routes.ACCOUNTS_REMOVE_DELEGATION}
                    negative
                    disabled={disabled}
                >
                    Remove delegation
                </ButtonNavLink>
            )}
        </>
    );
}

interface Props {
    account: Account;
    accountInfo: AccountInfo;
}

export default function Delegating({ account, accountInfo }: Props) {
    const isDelegating = isDelegatorAccount(accountInfo);
    const { pathname } = useLocation();
    const hasPendingTransaction = useSelector(
        hasPendingDelegationTransactionSelector
    );

    if (
        !pathname.startsWith(routes.ACCOUNTS_CONFIGURE_DELEGATION) &&
        !isDelegating
    ) {
        return <Redirect to={routes.ACCOUNTS} />;
    }

    return (
        <Switch>
            <Route path={routes.ACCOUNTS_CONFIGURE_DELEGATION}>
                <ConfigureDelegation
                    account={account}
                    accountInfo={accountInfo}
                    firstPageBack={isDelegating}
                />
            </Route>
            <Route path={routes.ACCOUNTS_REMOVE_DELEGATION}>
                <RemoveDelegation account={account} accountInfo={accountInfo} />
            </Route>
            <Route default>
                <StakingDetails
                    hasPendingTransaction={hasPendingTransaction}
                    details={
                        (accountInfo as AccountInfoDelegator).accountDelegation
                    }
                />
                <Actions
                    isDelegating={isDelegating}
                    disabled={hasPendingTransaction}
                />
            </Route>
        </Switch>
    );
}
