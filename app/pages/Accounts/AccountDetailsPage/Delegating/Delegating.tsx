import { AccountInfo, AccountInfoDelegator } from '@concordium/node-sdk';
import { isDelegatorAccount } from '@concordium/node-sdk/lib/src/accountHelpers';
import React from 'react';
import { Redirect, Route, Switch } from 'react-router';
import { Account } from '~/utils/types';
import routes from '~/constants/routes.json';
import ConfigureDelegation from './ConfigureDelegation';
import RemoveDelegation from './RemoveDelegation';
import ButtonNavLink from '~/components/ButtonNavLink';
import StakingDetails from '../StakingDetails';

const toRoot = <Redirect to={routes.ACCOUNTS_DELEGATING} />;

interface ActionsProps {
    isDelegating: boolean;
}

function Actions({ isDelegating }: ActionsProps) {
    return (
        <>
            <ButtonNavLink
                className="mB20:notLast flex width100"
                to={routes.ACCOUNTS_CONFIGURE_DELEGATION}
            >
                {isDelegating
                    ? 'Update current delegation'
                    : 'Register delegation'}
            </ButtonNavLink>
            {isDelegating && (
                <ButtonNavLink
                    className="flex width100"
                    to={routes.ACCOUNTS_REMOVE_DELEGATION}
                    negative
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

    return (
        <Switch>
            <Route path={routes.ACCOUNTS_CONFIGURE_DELEGATION}>
                <ConfigureDelegation
                    account={account}
                    accountInfo={accountInfo}
                />
            </Route>
            <Route path={routes.ACCOUNTS_REMOVE_DELEGATION}>
                {isDelegating ? (
                    <RemoveDelegation
                        account={account}
                        accountInfo={accountInfo}
                    />
                ) : (
                    toRoot
                )}
            </Route>
            <Route default>
                <StakingDetails
                    type="delegator"
                    hasPendingTransaction
                    details={
                        (accountInfo as AccountInfoDelegator).accountDelegation
                    }
                />
                <Actions isDelegating={isDelegating} />
            </Route>
        </Switch>
    );
}
