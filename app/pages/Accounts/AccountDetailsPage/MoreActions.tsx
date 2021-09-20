import React from 'react';
import { useSelector } from 'react-redux';
import { Account, AccountInfo, TransactionKindId } from '~/utils/types';
import routes from '~/constants/routes.json';
import ButtonNavLink from '~/components/ButtonNavLink';
import { accountHasDeployedCredentialsSelector } from '~/features/CredentialSlice';
import { createTransferWithAccountPathName } from '~/utils/accountRouterHelpers';
import { hasEncryptedBalance } from '~/utils/accountHelpers';

interface Props {
    account: Account;
    accountInfo: AccountInfo;
}

export default function MoreActions({ account, accountInfo }: Props) {
    const accountHasDeployedCredentials = useSelector(
        accountHasDeployedCredentialsSelector(account)
    );
    const hasUsedEncrypted = hasEncryptedBalance(account);
    const isBaker = Boolean(accountInfo.accountBaker);
    const hasBakerCooldown = Boolean(accountInfo?.accountBaker?.pendingChange);

    return (
        <>
            <ButtonNavLink
                className="mB20:notLast flex"
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
                <br />
                <span className="body4 pT5">{account.address}</span>
            </ButtonNavLink>
            {accountHasDeployedCredentials && (
                <ButtonNavLink
                    className="mB20:notLast flex"
                    to={routes.ACCOUNTS_CREATESCHEDULEDTRANSFER}
                >
                    Send GTU with a schedule
                </ButtonNavLink>
            )}
            <ButtonNavLink
                className="mB20:notLast flex"
                to={routes.ACCOUNTS_INSPECTRELEASESCHEDULE}
            >
                Inspect release schedule
            </ButtonNavLink>
            <ButtonNavLink
                className="mB20:notLast flex"
                to={{
                    pathname: routes.ACCOUNT_REPORT,
                    state: { account },
                }}
            >
                Export account reports
            </ButtonNavLink>
            <ButtonNavLink
                className="mB20:notLast flex"
                to={routes.ACCOUNTS_CREDENTIAL_INFORMATION}
            >
                Credential & attribute Information
            </ButtonNavLink>
            {accountHasDeployedCredentials && !hasUsedEncrypted && (
                <ButtonNavLink
                    className="mB20:notLast flex"
                    to={{
                        pathname: createTransferWithAccountPathName(
                            TransactionKindId.Update_credentials
                        ),
                        state: { account },
                    }}
                >
                    Update credentials
                </ButtonNavLink>
            )}
            {accountHasDeployedCredentials && !isBaker && (
                <ButtonNavLink
                    className="mB20:notLast flex"
                    to={{
                        pathname: createTransferWithAccountPathName(
                            TransactionKindId.Add_baker
                        ),
                        state: { account },
                    }}
                >
                    Add baker
                </ButtonNavLink>
            )}
            {accountHasDeployedCredentials && isBaker && (
                <>
                    {hasBakerCooldown || (
                        <ButtonNavLink
                            className="mB20:notLast flex"
                            to={{
                                pathname: createTransferWithAccountPathName(
                                    TransactionKindId.Remove_baker
                                ),
                                state: { account },
                            }}
                        >
                            Remove baker
                        </ButtonNavLink>
                    )}
                    <ButtonNavLink
                        className="mB20:notLast flex"
                        to={{
                            pathname: createTransferWithAccountPathName(
                                TransactionKindId.Update_baker_keys
                            ),
                            state: { account },
                        }}
                    >
                        Update baker keys
                    </ButtonNavLink>
                    {hasBakerCooldown || (
                        <ButtonNavLink
                            className="mB20:notLast flex"
                            to={{
                                pathname: createTransferWithAccountPathName(
                                    TransactionKindId.Update_baker_stake
                                ),
                                state: { account },
                            }}
                        >
                            Update baker stake
                        </ButtonNavLink>
                    )}
                    <ButtonNavLink
                        className="mB20:notLast flex"
                        to={{
                            pathname: createTransferWithAccountPathName(
                                TransactionKindId.Update_baker_restake_earnings
                            ),
                            state: { account },
                        }}
                    >
                        Update baker restake earnings
                    </ButtonNavLink>
                </>
            )}
        </>
    );
}
