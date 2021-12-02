import React, { useState, ReactElement, useCallback } from 'react';
import clsx from 'clsx';
import { useSelector } from 'react-redux';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import Button from '~/cross-app-components/Button';
import MessageModal from '~/components/MessageModal';
import Ledger from '~/components/ledger/Ledger';
import { asyncNoOp } from '~/utils/basicHelpers';
import {
    findLocalDeployedCredential,
    hasFirstCredential,
} from '~/utils/credentialHelper';
import { specificIdentitySelector } from '~/features/IdentitySlice';
import { walletIdSelector } from '~/features/WalletSlice';
import { Account, ClassName } from '~/utils/types';
import { useAsyncMemo } from '~/utils/hooks';

interface Props extends ClassName {
    account: Account;
    display: ReactElement;
}

/**
 * Allows the user to verify the address of the current account, on the ledger.
 */
export default function VerifyAddress({ account, display, className }: Props) {
    const [opened, setOpened] = useState(false);
    const [warning, setWarning] = useState<string>();
    const identity = useSelector(specificIdentitySelector(account.identityId));
    const walletId = useSelector(walletIdSelector);
    const credential = useAsyncMemo(
        () =>
            walletId
                ? findLocalDeployedCredential(walletId, account.address)
                : Promise.resolve(undefined),
        () => {},
        [walletId, account.address]
    );

    const reasonForNotBeingVerifiable = useAsyncMemo(
        async () => {
            if (identity === undefined) {
                return 'No identity was found for this account. This is an internal error that should be reported.';
            }
            if (!(await hasFirstCredential(account.address))) {
                return "An account's address is derived from the initial credential on that account. The initial credential is not in this wallet, and therefore it is not possible to verify the address of the account.";
            }
            if (identity.version === 0) {
                return 'The identity used to create this account uses a deprecated version of the key generation. It is recommended to create a new identity and use accounts on that instead.';
            }
            return undefined;
        },
        () => {},
        [identity, account.address]
    );

    const ledgerCall = useCallback(
        async (ledger: ConcordiumLedgerClient) => {
            setOpened(true);
            if (credential === undefined) {
                setWarning(
                    'No credentials, that were created by the current Ledger, were found on this account. Please verify that the connected Ledger is for this account.'
                );
            } else if (credential.credentialIndex !== 0) {
                setWarning(
                    "An account's address is derived from the initial credential on that account. The initial credential on this account was not created from the currently connected Ledger, and therefore it is not possible to verify the address of the account."
                );
            } else {
                await ledger.verifyAddress(
                    credential.identityNumber,
                    credential.credentialNumber
                );
            }
            setOpened(false);
        },
        [credential?.identityNumber, credential?.credentialNumber]
    );

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
                        {reasonForNotBeingVerifiable && (
                            <>
                                {display}
                                <p className="textCenter">
                                    {reasonForNotBeingVerifiable}
                                </p>
                            </>
                        )}
                        {!reasonForNotBeingVerifiable && (
                            <>
                                {opened || (
                                    <div
                                        className={clsx(
                                            className,
                                            'flexColumn'
                                        )}
                                    >
                                        <h3 className="mB40 mT0">
                                            Unlock Ledger to verify and show
                                            address
                                        </h3>
                                        {statusView}
                                        <Button
                                            size="big"
                                            disabled={!isReady}
                                            className="m40"
                                            onClick={submitHandler}
                                        >
                                            Show and Verify Address
                                        </Button>
                                    </div>
                                )}
                                {opened && display}
                            </>
                        )}
                    </>
                )}
            </Ledger>
        </>
    );
}
