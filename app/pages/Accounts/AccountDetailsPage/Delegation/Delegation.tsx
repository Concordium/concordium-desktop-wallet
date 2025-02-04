import {
    AccountInfo,
    AccountInfoDelegator,
    AccountInfoType,
} from '@concordium/web-sdk';

import React from 'react';
import { Redirect, Route, Switch, useLocation } from 'react-router';
import { Account } from '~/utils/types';
import routes from '~/constants/routes.json';
import AddDelegation from './AddDelegation';
import UpdateDelegation from './UpdateDelegation';
import RemoveDelegation from './RemoveDelegation';
import ButtonNavLink from '~/components/ButtonNavLink';
import StakingDetails from '../StakingDetails';

interface ActionsProps {
    isDelegating: boolean;
}

function Actions({ isDelegating }: ActionsProps) {
    return (
        <>
            <ButtonNavLink
                className="mB20:notLast flex width100"
                to={routes.ACCOUNTS_UPDATE_DELEGATION}
            >
                Update delegation
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

export default function Delegation({ account, accountInfo }: Props) {
    const isDelegating = accountInfo.type === AccountInfoType.Delegator;
    const { pathname } = useLocation();

    if (!pathname.startsWith(routes.ACCOUNTS_ADD_DELEGATION) && !isDelegating) {
        return <Redirect to={routes.ACCOUNTS} />;
    }

    return (
        <Switch>
            <Route path={routes.ACCOUNTS_ADD_DELEGATION}>
                <AddDelegation account={account} accountInfo={accountInfo} />
            </Route>
            <Route path={routes.ACCOUNTS_UPDATE_DELEGATION}>
                <UpdateDelegation account={account} accountInfo={accountInfo} />
            </Route>
            <Route path={routes.ACCOUNTS_REMOVE_DELEGATION}>
                <RemoveDelegation account={account} accountInfo={accountInfo} />
            </Route>
            <Route default>
                <StakingDetails
                    details={
                        (accountInfo as AccountInfoDelegator).accountDelegation
                    }
                />
                <Actions isDelegating={isDelegating} />
            </Route>
        </Switch>
    );
}
