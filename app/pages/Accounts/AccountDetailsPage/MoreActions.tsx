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
    accountInfo?: AccountInfo;
}

export default function MoreActions({ account, accountInfo }: Props) {
    const accountHasDeployedCredentials = useSelector(
        accountHasDeployedCredentialsSelector(account)
    );
    const hasUsedEncrypted = hasEncryptedBalance(account);
    const isBaker = Boolean(accountInfo?.accountBaker);
    const hasBakerCooldown = Boolean(accountInfo?.accountBaker?.pendingChange);

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
                <br />
                <span className="body4 pT5">{account.address}</span>
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
                Credential & attribute Information
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
            {accountHasDeployedCredentials && !isBaker && (
                <ButtonNavLink
                    className="mB20:notLast flex width100"
                    to={{
                        pathname: createTransferWithAccountPathName(
                            TransactionKindId.Add_baker
                        ),
                        state: { account },
                    }}
                    disabled={!accountInfo}
                >
                    Add baker
                </ButtonNavLink>
            )}
            {accountHasDeployedCredentials && isBaker && (
                <>
                    {hasBakerCooldown || (
                        <ButtonNavLink
                            className="mB20:notLast flex width100"
                            to={{
                                pathname: createTransferWithAccountPathName(
                                    TransactionKindId.Remove_baker
                                ),
                                state: { account },
                            }}
                            disabled={!accountInfo}
                        >
                            Remove baker
                        </ButtonNavLink>
                    )}
                    <ButtonNavLink
                        className="mB20:notLast flex width100"
                        to={{
                            pathname: createTransferWithAccountPathName(
                                TransactionKindId.Update_baker_keys
                            ),
                            state: { account },
                        }}
                        disabled={!accountInfo}
                    >
                        Update baker keys
                    </ButtonNavLink>
                    {hasBakerCooldown || (
                        <ButtonNavLink
                            className="mB20:notLast flex width100"
                            to={{
                                pathname: createTransferWithAccountPathName(
                                    TransactionKindId.Update_baker_stake
                                ),
                                state: { account },
                            }}
                            disabled={!accountInfo}
                        >
                            Update baker stake
                        </ButtonNavLink>
                    )}
                    <ButtonNavLink
                        className="mB20:notLast flex width100"
                        to={{
                            pathname: createTransferWithAccountPathName(
                                TransactionKindId.Update_baker_restake_earnings
                            ),
                            state: { account },
                        }}
                        disabled={!accountInfo}
                    >
                        Update baker restake earnings
                    </ButtonNavLink>
                </>
            )}
        </>
    );
}
