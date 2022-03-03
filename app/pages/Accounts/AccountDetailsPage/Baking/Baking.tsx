import {
    AccountBakerDetails,
    AccountInfo,
    AccountInfoBaker,
} from '@concordium/node-sdk';
import { isBakerAccount } from '@concordium/node-sdk/lib/src/accountHelpers';
import React from 'react';
import { Redirect, Route, Switch } from 'react-router';
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

const toRoot = <Redirect to={routes.ACCOUNTS_BAKING} />;

interface DetailsProps {
    details: AccountBakerDetails | undefined;
}

function Details({ details: _ }: DetailsProps) {
    return <div>Baker pool details...</div>;
}

interface ActionsProps {
    isBaker: boolean;
    isDelegationPV: boolean;
}

function Actions({ isBaker, isDelegationPV }: ActionsProps) {
    if (!isBaker) {
        return (
            <ButtonNavLink
                className="flex width100"
                to={routes.ACCOUNTS_ADD_BAKER}
            >
                Add baker
            </ButtonNavLink>
        );
    }
    return (
        <>
            <ButtonNavLink
                className="mB20:notLast flex width100"
                to={routes.ACCOUNTS_UPDATE_BAKER_STAKE}
            >
                Update baker stake
            </ButtonNavLink>
            {isDelegationPV ? (
                <ButtonNavLink
                    className="mB20:notLast flex width100"
                    to={routes.ACCOUNTS_UPDATE_BAKER_RESTAKE_EARNINGS}
                >
                    Update baker restake earnings
                </ButtonNavLink>
            ) : (
                <ButtonNavLink
                    className="mB20:notLast flex width100"
                    to={routes.ACCOUNTS_UPDATE_BAKER_POOL}
                >
                    Update baker pool
                </ButtonNavLink>
            )}
            <ButtonNavLink
                className="mB20:notLast flex width100"
                to={routes.ACCOUNTS_UPDATE_BAKER_KEYS}
            >
                Update baker keys
            </ButtonNavLink>
            <ButtonNavLink
                className="flex width100"
                to={routes.ACCOUNTS_REMOVE_BAKER}
                negative
            >
                Remove baker
            </ButtonNavLink>
        </>
    );
}

interface Props {
    account: Account;
    accountInfo: AccountInfo;
}

export default function Baking({ account, accountInfo }: Props) {
    const pv = useProtocolVersion();
    const isDelegationPV = pv !== undefined && hasDelegationProtocol(pv);
    const isBaker = isBakerAccount(accountInfo);

    return (
        <Switch>
            <Route
                path={routes.ACCOUNTS_ADD_BAKER}
                render={({ location }) => {
                    if (isBaker) {
                        return toRoot;
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
                {isBaker || toRoot}
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
                {isBaker || toRoot}
                {isBaker && isDelegationPV && (
                    <UpdateBakerKeys account={account} />
                )}
                {isBaker && !isDelegationPV && (
                    <OldUpdateBakerKeys account={account} />
                )}
            </Route>
            <Route path={routes.ACCOUNTS_UPDATE_BAKER_STAKE}>
                {isBaker || toRoot}
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
                {isBaker && !isDelegationPV ? (
                    <OldUpdateBakerRestake
                        account={account}
                        accountInfo={accountInfo as AccountInfoBaker}
                    />
                ) : (
                    toRoot
                )}
            </Route>
            <Route path={routes.ACCOUNTS_UPDATE_BAKER_POOL}>
                {isDelegationPV && isBaker ? (
                    <UpdateBakerPool
                        account={account}
                        accountInfo={accountInfo}
                    />
                ) : (
                    toRoot
                )}
            </Route>
            <Route default>
                <Details
                    details={(accountInfo as AccountInfoBaker).accountBaker}
                />
                <Actions isBaker={isBaker} isDelegationPV={isDelegationPV} />
            </Route>
        </Switch>
    );
}
