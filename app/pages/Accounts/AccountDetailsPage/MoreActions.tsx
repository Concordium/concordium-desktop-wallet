import React from 'react';
import { useSelector } from 'react-redux';
import { isBakerAccount } from '@concordium/node-sdk/lib/src/accountHelpers';
import { Account, AccountInfo, TransactionKindId } from '~/utils/types';
import routes from '~/constants/routes.json';
import ButtonNavLink from '~/components/ButtonNavLink';
import { accountHasDeployedCredentialsSelector } from '~/features/CredentialSlice';
import { createTransferWithAccountPathName } from '~/utils/accountRouterHelpers';
import { hasEncryptedBalance } from '~/utils/accountHelpers';
import { useProtocolVersion } from '~/utils/dataHooks';
import { hasDelegationProtocol } from '~/utils/protocolVersion';

interface Props {
    account: Account;
    accountInfo?: AccountInfo;
}

export default function MoreActions({ account, accountInfo }: Props) {
    const accountHasDeployedCredentials = useSelector(
        accountHasDeployedCredentialsSelector(account)
    );
    const hasUsedEncrypted = hasEncryptedBalance(account);
    const isBaker = accountInfo !== undefined && isBakerAccount(accountInfo);
    const pv = useProtocolVersion();
    const isDelegationPV = pv !== undefined && hasDelegationProtocol(pv);
    const canDelegate =
        isDelegationPV && !isBaker && accountHasDeployedCredentials;

    return (
        <>
            <ButtonNavLink
                className="mB20:notLast flex width100"
                exact
                to={routes.ACCOUNTS}
            >
                Transaction log
            </ButtonNavLink>
            <ButtonNavLink
                className="mB20:notLast flexColumn justifyCenter"
                to={routes.ACCOUNTS_ADDRESS}
            >
                Account address
            </ButtonNavLink>
            {accountHasDeployedCredentials && (
                <ButtonNavLink
                    className="mB20:notLast flex width100"
                    to={routes.ACCOUNTS_CREATESCHEDULEDTRANSFER}
                    disabled={!accountInfo}
                >
                    Send CCD with a schedule
                </ButtonNavLink>
            )}
            <ButtonNavLink
                className="mB20:notLast flex width100"
                to={routes.ACCOUNTS_INSPECTRELEASESCHEDULE}
                disabled={!accountInfo}
            >
                Inspect release schedule
            </ButtonNavLink>
            <ButtonNavLink
                className="mB20:notLast flex width100"
                to={{
                    pathname: routes.ACCOUNT_REPORT,
                    state: { account },
                }}
            >
                Export account reports
            </ButtonNavLink>
            <ButtonNavLink
                className="mB20:notLast flex width100"
                to={routes.ACCOUNTS_CREDENTIAL_INFORMATION}
            >
                Credential & attribute information
            </ButtonNavLink>
            {accountHasDeployedCredentials && !hasUsedEncrypted && (
                <ButtonNavLink
                    className="mB20:notLast flex width100"
                    to={{
                        pathname: createTransferWithAccountPathName(
                            TransactionKindId.Update_credentials
                        ),
                        state: { account },
                    }}
                    disabled={!accountInfo}
                >
                    Update credentials
                </ButtonNavLink>
            )}
            {accountHasDeployedCredentials && isDelegationPV && (
                <ButtonNavLink
                    className="mB20:notLast flex width100"
                    to={routes.ACCOUNTS_BAKING}
                    disabled={!accountInfo}
                >
                    Baking
                </ButtonNavLink>
            )}
            {accountHasDeployedCredentials &&
                !isDelegationPV &&
                (isBaker ? (
                    <>
                        <ButtonNavLink
                            className="mB20:notLast flex width100"
                            to={routes.ACCOUNTS_REMOVE_BAKER}
                            disabled={!accountInfo}
                        >
                            Remove baker
                        </ButtonNavLink>
                        <ButtonNavLink
                            className="mB20:notLast flex width100"
                            to={routes.ACCOUNTS_UPDATE_BAKER_STAKE}
                            disabled={!accountInfo}
                        >
                            Update baker stake
                        </ButtonNavLink>
                        <ButtonNavLink
                            className="mB20:notLast flex width100"
                            to={routes.ACCOUNTS_UPDATE_BAKER_RESTAKE_EARNINGS}
                            disabled={!accountInfo}
                        >
                            Update baker restake earnings
                        </ButtonNavLink>
                        <ButtonNavLink
                            className="mB20:notLast flex width100"
                            to={routes.ACCOUNTS_UPDATE_BAKER_KEYS}
                            disabled={!accountInfo}
                        >
                            Update baker keys
                        </ButtonNavLink>
                    </>
                ) : (
                    <ButtonNavLink
                        className="mB20:notLast flex width100"
                        to={routes.ACCOUNTS_ADD_BAKER}
                        disabled={!accountInfo}
                    >
                        Add baker
                    </ButtonNavLink>
                ))}
            {canDelegate && (
                <ButtonNavLink
                    className="mB20:notLast flex width100"
                    to={routes.ACCOUNTS_DELEGATING}
                    disabled={!accountInfo}
                >
                    Delegating
                </ButtonNavLink>
            )}
        </>
    );
}
