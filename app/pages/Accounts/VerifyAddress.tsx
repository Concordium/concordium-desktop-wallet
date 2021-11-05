import React, { useState } from 'react';
import clsx from 'clsx';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import CloseButton from '~/cross-app-components/CloseButton';
import Button from '~/cross-app-components/Button';
import Card from '~/cross-app-components/Card';
import MessageModal from '~/components/MessageModal';
import Ledger from '~/components/ledger/Ledger';
import { asyncNoOp } from '~/utils/basicHelpers';
import findLocalDeployedCredentialWithWallet from '~/utils/credentialHelper';
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
    const [showWarning, setShowWarning] = useState(false);

    async function ledgerCall(ledger: ConcordiumLedgerClient) {
        if (account.identityNumber === undefined) {
            throw new Error(
                'The account is missing an identity number. This is an internal error that should be reported'
            );
        }

        const credential = await findLocalDeployedCredentialWithWallet(
            account.address,
            ledger
        );
        if (credential === undefined) {
            throw new Error(
                'Unable to decrypt shielded balance and encrypted transfers. Please verify that the connected wallet is for this account.'
            );
        }

        if (credential.credentialIndex !== 0) {
            setShowWarning(true);
        } else {
            await ledger.verifyAddress(
                credential.identityNumber,
                credential.credentialNumber
            );
        }
    }

    return (
        <>
            <MessageModal
                title="Unable to verify Address."
                message="An account's address is computed using the first credential, and your current Ledger device did not generate that."
                buttonText="Okay"
                onClose={() => setShowWarning(false)}
                open={showWarning}
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
