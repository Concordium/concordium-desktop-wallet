import { AccountInfo } from '@concordium/node-sdk';
import { isDelegatorAccount } from '@concordium/node-sdk/lib/src/accountHelpers';
import React from 'react';
import { Redirect, Route, Switch } from 'react-router';
import { Account } from '~/utils/types';
import routes from '~/constants/routes.json';
import ConfigureDelegation from './ConfigureDelegation';
import RemoveDelegation from './RemoveDelegation';
import ButtonNavLink from '~/components/ButtonNavLink';

const toRoot = <Redirect to={routes.ACCOUNTS_DELEGATING} />;

interface DetailsProps {
    accountInfo: AccountInfo;
}

function Details({ accountInfo: _ }: DetailsProps) {
    return <div>Delegation details...</div>;
}

interface ActionsProps {
    accountInfo: AccountInfo;
}

function Actions({ accountInfo }: ActionsProps) {
    const isDelegating = isDelegatorAccount(accountInfo);
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
                <Details accountInfo={accountInfo} />
                <Actions accountInfo={accountInfo} />
            </Route>
        </Switch>
    );
}
