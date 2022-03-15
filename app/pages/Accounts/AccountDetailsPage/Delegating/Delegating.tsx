import {
    AccountDelegationDetails,
    AccountInfo,
    AccountInfoDelegator,
} from '@concordium/node-sdk';
import { isDelegatorAccount } from '@concordium/node-sdk/lib/src/accountHelpers';
import React from 'react';
import { Redirect, Route, Switch } from 'react-router';
import { Account } from '~/utils/types';
import routes from '~/constants/routes.json';
import ConfigureDelegation from './ConfigureDelegation';
import RemoveDelegation from './RemoveDelegation';
import ButtonNavLink from '~/components/ButtonNavLink';
import StakingDetails from '../StakingDetails';
import { displayAsCcd } from '~/utils/ccd';
import { displayDelegationTarget } from '~/utils/transactionFlows/configureDelegation';

const toRoot = <Redirect to={routes.ACCOUNTS_DELEGATING} />;

interface DetailsProps {
    details: AccountDelegationDetails | undefined;
}

function Details({ details }: DetailsProps) {
    return (
        <StakingDetails
            title={
                details !== undefined
                    ? 'Delegation registered'
                    : 'No delegation registered'
            }
            pending={details?.pendingChange}
            type="delegator"
        >
            {details !== undefined && (
                <>
                    <StakingDetails.Value
                        title="Delegation amount"
                        value={displayAsCcd(details.stakedAmount)}
                    />
                    <StakingDetails.Value
                        title="Target pool"
                        value={displayDelegationTarget(
                            details.delegationTarget
                        )}
                    />
                    <StakingDetails.Value
                        title="Rewards wil be"
                        value={
                            details.restakeEarnings
                                ? 'Added to delegation amount'
                                : 'Added to public balance'
                        }
                    />
                </>
            )}
        </StakingDetails>
    );
}

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
                <Details
                    details={
                        (accountInfo as AccountInfoDelegator).accountDelegation
                    }
                />
                <Actions isDelegating={isDelegating} />
            </Route>
        </Switch>
    );
}
