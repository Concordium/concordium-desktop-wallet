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
    const [noVerify, setNoVerify] = useState(false);
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
                return 'The address cannot be verified, because the identity used to create this account uses a deprecated version of the key generation, which is not available on the Ledger.';
            }
            return undefined;
        },
        () => {},
        [identity, account.address]
    );

    const showWithoutLedger = useCallback(
        (show: boolean) => {
            setNoVerify(show);
            setOpened(show);
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );

    const ledgerCall = useCallback(
        async (ledger: ConcordiumLedgerClient) => {
            if (credential === undefined) {
                setWarning(
                    'No credentials, that were created by the current Ledger, were found on this account. Please verify that the connected Ledger is for this account.'
                );
            } else if (credential.credentialIndex !== 0) {
                setWarning(
                    "An account's address is derived from the initial credential on that account. The initial credential on this account was not created from the currently connected Ledger, and therefore it is not possible to verify the address of the account."
                );
            } else {
                const timeout = setTimeout(setOpened, 100, true);
                try {
                    await ledger.verifyAddress(
                        credential.identityNumber,
                        credential.credentialNumber
                    );
                } finally {
                    clearTimeout(timeout);
                    setOpened(false);
                }
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
                                            'flexColumn textCenter mT40'
                                        )}
                                    >
                                        {statusView}
                                        <Button
                                            size="big"
                                            disabled={!isReady}
                                            className="m40"
                                            onClick={submitHandler}
                                        >
                                            Show and verify address
                                        </Button>
                                        <Button
                                            size="small"
                                            inverted
                                            className="mH50"
                                            onClick={() =>
                                                showWithoutLedger(true)
                                            }
                                        >
                                            Show without verifying
                                        </Button>
                                    </div>
                                )}
                                {opened && display}
                                {noVerify && opened && (
                                    <Button
                                        size="small"
                                        className="mT20"
                                        onClick={() => showWithoutLedger(false)}
                                    >
                                        Hide address
                                    </Button>
                                )}
                            </>
                        )}
                    </>
                )}
            </Ledger>
        </>
    );
}
