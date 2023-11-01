import {
    AccountInfo,
    AccountInfoBaker,
    isBakerAccount,
} from '@concordium/web-sdk';

import React from 'react';
import { Redirect, Route, Switch, useLocation } from 'react-router';
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

interface ActionsProps {
    isDelegationPV: boolean;
}

function Actions({ isDelegationPV }: ActionsProps) {
    return (
        <>
            <ButtonNavLink
                className="mB20 flex width100"
                to={routes.ACCOUNTS_UPDATE_BAKER_STAKE}
            >
                Update validator stake
            </ButtonNavLink>
            {isDelegationPV ? (
                <ButtonNavLink
                    className="mB20 flex width100"
                    to={routes.ACCOUNTS_UPDATE_BAKER_POOL}
                >
                    Update staking pool
                </ButtonNavLink>
            ) : (
                <ButtonNavLink
                    className="mB20 flex width100"
                    to={routes.ACCOUNTS_UPDATE_BAKER_RESTAKE_EARNINGS}
                >
                    Update validator restake earnings
                </ButtonNavLink>
            )}
            <ButtonNavLink
                className="mB20 flex width100"
                to={routes.ACCOUNTS_UPDATE_BAKER_KEYS}
            >
                Update validator keys
            </ButtonNavLink>
            <ButtonNavLink
                className="flex width100"
                to={routes.ACCOUNTS_REMOVE_BAKER}
                negative
            >
                Stop validation
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

    if (!pathname.startsWith(routes.ACCOUNTS_ADD_BAKER) && !isBaker) {
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
                    details={(accountInfo as AccountInfoBaker).accountBaker}
                />
                <Actions isDelegationPV={isDelegationPV} />
            </Route>
        </Switch>
    );
}
