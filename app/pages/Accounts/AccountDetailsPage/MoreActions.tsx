import React from 'react';
import { useSelector } from 'react-redux';
import { isBakerAccount, isDelegatorAccount } from '@concordium/web-sdk';
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
    const isDelegating =
        accountInfo !== undefined && isDelegatorAccount(accountInfo);
    const pv = useProtocolVersion(true);
    const isDelegationPV = pv !== undefined && hasDelegationProtocol(pv);

    return (
        <>
            <ButtonNavLink
                className="mB20 flex width100"
                exact
                to={routes.ACCOUNTS}
            >
                Transaction log
            </ButtonNavLink>
            {accountHasDeployedCredentials && (
                <ButtonNavLink
                    className="mB20 flex width100"
                    to={routes.ACCOUNTS_CREATESCHEDULEDTRANSFER}
                    disabled={!accountInfo}
                >
                    Send CCD with a schedule
                </ButtonNavLink>
            )}
            <ButtonNavLink
                className="mB20 flex width100"
                to={routes.ACCOUNTS_INSPECTRELEASESCHEDULE}
                disabled={!accountInfo}
            >
                Inspect release schedule
            </ButtonNavLink>
            <ButtonNavLink
                className="mB20 flex width100"
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
            {accountHasDeployedCredentials && (
                <ButtonNavLink
                    className="mB20:notLast flex width100"
                    to={{
                        pathname: createTransferWithAccountPathName(
                            TransactionKindId.Register_data
                        ),
                        state: { account },
                    }}
                    disabled={!accountInfo}
                >
                    Register data
                </ButtonNavLink>
            )}
            {accountHasDeployedCredentials && !isDelegating && !isBaker && (
                <>
                    <ButtonNavLink
                        className="mB20:notLast flex width100"
                        to={routes.ACCOUNTS_ADD_BAKER}
                        disabled={!accountInfo}
                    >
                        Register as a validator
                    </ButtonNavLink>
                    {isDelegationPV && (
                        <ButtonNavLink
                            className="mB20:notLast flex width100"
                            to={routes.ACCOUNTS_ADD_DELEGATION}
                            disabled={!accountInfo}
                        >
                            Register as a delegator
                        </ButtonNavLink>
                    )}
                </>
            )}
            {accountHasDeployedCredentials && !isDelegating && isBaker && (
                <ButtonNavLink
                    className="mB20:notLast flex width100"
                    to={routes.ACCOUNTS_BAKING}
                    disabled={!accountInfo}
                >
                    Validation
                </ButtonNavLink>
            )}
            {accountHasDeployedCredentials &&
                isDelegationPV &&
                isDelegating &&
                !isBaker && (
                    <ButtonNavLink
                        className="mB20:notLast flex width100"
                        to={routes.ACCOUNTS_DELEGATION}
                        disabled={!accountInfo}
                    >
                        Delegation
                    </ButtonNavLink>
                )}
        </>
    );
}
