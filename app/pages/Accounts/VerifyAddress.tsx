import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import clsx from 'clsx';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import CloseButton from '~/cross-app-components/CloseButton';
import Button from '~/cross-app-components/Button';
import Card from '~/cross-app-components/Card';
import MessageModal from '~/components/MessageModal';
import Ledger from '~/components/ledger/Ledger';
import { asyncNoOp } from '~/utils/basicHelpers';
import findLocalDeployedCredentialWithWallet from '~/utils/credentialHelper';
import { specificIdentitySelector } from '~/features/IdentitySlice';
import { Account, ClassName } from '~/utils/types';

import styles from './Accounts.module.scss';

interface Props extends ClassName {
    account: Account;
}

/**
 * Allows the user to verify the address of the current account, on the ledger.
 */
export default function VerifyAddress({ account, className }: Props) {
    const [opened, setOpened] = useState(false);
    const [warning, setWarning] = useState<string>();
    const identity = useSelector(specificIdentitySelector(account.identityId));

    async function ledgerCall(ledger: ConcordiumLedgerClient) {
        if (identity === undefined) {
            throw new Error(
                'No identity was found for this account. This is an internal error that should be reported.'
            );
        }

        const credential = await findLocalDeployedCredentialWithWallet(
            account.address,
            ledger
        );

        if (credential === undefined) {
            throw new Error(
                'No credentials, that were created by the current Ledger, were found on this account. Please verify that the connected Ledger is for this account.'
            );
        }

        if (credential.credentialIndex !== 0) {
            setWarning(
                "An account's address is derived from the initial credential on that account. The initial credential on this account was not created from the currently connected Ledger, and therefore it is not possible to verify the address of the account."
            );
        } else if (identity.version === 0) {
            setWarning(
                'The identity used to create this account uses a deprecated version of the key generation. It is recommended to create a new identity and use accounts on that instead.'
            );
        } else {
            await ledger.verifyAddress(
                credential.identityNumber,
                credential.credentialNumber
            );
            setOpened(false);
        }
    }

    return (
        <>
            <MessageModal
                title="Unable to verify account address."
                message={warning}
                buttonText="Okay"
                onClose={() => setWarning(undefined)}
                open={Boolean(warning)}
                disableClose
            />
            <Ledger ledgerCallback={ledgerCall}>
                {({ isReady, statusView, submitHandler = asyncNoOp }) => (
                    <>
                        {opened || (
                            <Button
                                size="big"
                                className="mT20"
                                onClick={() => setOpened(true)}
                            >
                                Verify Address on Ledger device
                            </Button>
                        )}
                        {opened && (
                            <Card
                                className={clsx(
                                    styles.verifyAddress,
                                    className,
                                    'flexColumn textCenter mT20'
                                )}
                            >
                                <CloseButton
                                    onClick={() => setOpened(false)}
                                    className={styles.verifyAddressCloseButton}
                                />
                                <h3 className="mB40">Verify Address</h3>
                                {statusView}
                                <Button
                                    size="big"
                                    disabled={!isReady}
                                    className="m40"
                                    onClick={submitHandler}
                                >
                                    Verify Address
                                </Button>
                            </Card>
                        )}
                    </>
                )}
            </Ledger>
        </>
    );
}
