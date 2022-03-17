import { AccountInfo, AccountInfoBaker } from '@concordium/node-sdk';
import { isBakerAccount } from '@concordium/node-sdk/lib/src/accountHelpers';
import React from 'react';
import { Redirect, Route, Switch, useLocation } from 'react-router';
import { useSelector } from 'react-redux';
import { LocationDescriptorObject } from 'history';
import { Account } from '~/utils/types';
import routes from '~/constants/routes.json';
import ButtonNavLink from '~/components/ButtonNavLink';
import { StakeSettings } from '~/utils/transactionFlows/configureBaker';
import { useProtocolVersion } from '~/utils/dataHooks';
import { hasDelegationProtocol } from '~/utils/protocolVersion';
import OldAddBaker from './OldBakerFlows/AddBaker';
import OldRemoveBaker from './OldBakerFlows/RemoveBaker';
import OldUpdateBakerKeys from './OldBakerFlows/UpdateBakerKeys';
import OldUpdateBakerStake from './OldBakerFlows/UpdateBakerStake';
import OldUpdateBakerRestake from './OldBakerFlows/UpdateBakerRestake';
import AddBaker from './AddBaker';
import RemoveBaker from './RemoveBaker';
import UpdateBakerStake from './UpdateBakerStake';
import UpdateBakerPool from './UpdateBakerPool';
import UpdateBakerKeys from './UpdateBakerKeys';
import StakingDetails from '../StakingDetails';
import { hasPendingBakerTransactionSelector } from '~/features/TransactionSlice';

interface ActionsProps {
    isDelegationPV: boolean;
    disabled: boolean;
}

function Actions({ isDelegationPV, disabled }: ActionsProps) {
    return (
        <>
            <ButtonNavLink
                className="mB20:notLast flex width100"
                to={routes.ACCOUNTS_UPDATE_BAKER_STAKE}
                disabled={disabled}
            >
                Update baker stake
            </ButtonNavLink>
            {isDelegationPV ? (
                <ButtonNavLink
                    className="mB20:notLast flex width100"
                    to={routes.ACCOUNTS_UPDATE_BAKER_POOL}
                    disabled={disabled}
                >
                    Update baker pool
                </ButtonNavLink>
            ) : (
                <ButtonNavLink
                    className="mB20:notLast flex width100"
                    to={routes.ACCOUNTS_UPDATE_BAKER_RESTAKE_EARNINGS}
                    disabled={disabled}
                >
                    Update baker restake earnings
                </ButtonNavLink>
            )}
            <ButtonNavLink
                className="mB20:notLast flex width100"
                to={routes.ACCOUNTS_UPDATE_BAKER_KEYS}
                disabled={disabled}
            >
                Update baker keys
            </ButtonNavLink>
            <ButtonNavLink
                className="flex width100"
                to={routes.ACCOUNTS_REMOVE_BAKER}
                negative
                disabled={disabled}
            >
                Stop baking
            </ButtonNavLink>
        </>
    );
}

interface Props {
    account: Account;
    accountInfo: AccountInfo;
}

export default function Baking({ account, accountInfo }: Props) {
    const pv = useProtocolVersion(true);
    const { pathname } = useLocation();
    const isDelegationPV = pv !== undefined && hasDelegationProtocol(pv);
    const isBaker = isBakerAccount(accountInfo);
    const hasPendingTransaction = useSelector(
        hasPendingBakerTransactionSelector
    );

    if (pathname !== routes.ACCOUNTS_ADD_BAKER && !isBaker) {
        return <Redirect to={routes.ACCOUNTS} />;
    }

    return (
        <Switch>
            <Route
                path={routes.ACCOUNTS_ADD_BAKER}
                render={({ location }) => {
                    if (isBaker) {
                        return <Redirect to={routes.ACCOUNTS_BAKING} />;
                    }

                    if (isDelegationPV) {
                        return (
                            <AddBaker
                                account={account}
                                accountInfo={accountInfo}
                            />
                        );
                    }

                    return (
                        <OldAddBaker
                            location={
                                location as LocationDescriptorObject<StakeSettings>
                            }
                            account={account}
                        />
                    );
                }}
            />
            <Route path={routes.ACCOUNTS_REMOVE_BAKER}>
                {isBaker && isDelegationPV && (
                    <RemoveBaker account={account} accountInfo={accountInfo} />
                )}
                {isBaker && !isDelegationPV && (
                    <OldRemoveBaker
                        account={account}
                        accountInfo={accountInfo}
                    />
                )}
            </Route>
            <Route path={routes.ACCOUNTS_UPDATE_BAKER_KEYS}>
                {isBaker && isDelegationPV && (
                    <UpdateBakerKeys account={account} />
                )}
                {isBaker && !isDelegationPV && (
                    <OldUpdateBakerKeys account={account} />
                )}
            </Route>
            <Route path={routes.ACCOUNTS_UPDATE_BAKER_STAKE}>
                {isBaker && isDelegationPV && (
                    <UpdateBakerStake
                        account={account}
                        accountInfo={accountInfo}
                    />
                )}
                {isBaker && !isDelegationPV && (
                    <OldUpdateBakerStake
                        account={account}
                        accountInfo={accountInfo}
                    />
                )}
            </Route>
            <Route path={routes.ACCOUNTS_UPDATE_BAKER_RESTAKE_EARNINGS}>
                <OldUpdateBakerRestake
                    account={account}
                    accountInfo={accountInfo as AccountInfoBaker}
                />
            </Route>
            <Route path={routes.ACCOUNTS_UPDATE_BAKER_POOL}>
                <UpdateBakerPool account={account} accountInfo={accountInfo} />
            </Route>
            <Route default>
                <StakingDetails
                    hasPendingTransaction={hasPendingTransaction}
                    details={(accountInfo as AccountInfoBaker).accountBaker}
                />
                <Actions
                    disabled={hasPendingTransaction}
                    isDelegationPV={isDelegationPV}
                />
            </Route>
        </Switch>
    );
}
