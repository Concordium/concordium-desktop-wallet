import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { decryptAccountBalance } from '~/features/AccountSlice';
import { globalSelector } from '~/features/GlobalSlice';
import { specificIdentitySelector } from '~/features/IdentitySlice';
import {
    shieldedTransactionsSelector,
    updateTransactionFields,
} from '~/features/TransactionSlice';
import { Account } from '~/utils/types';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import Ledger from '~/components/ledger/Ledger';
import { asyncNoOp } from '~/utils/basicHelpers';
import Card from '~/cross-app-components/Card';
import Button from '~/cross-app-components/Button';
import findLocalDeployedCredentialWithWallet from '~/utils/credentialHelper';
import errorMessages from '~/constants/errorMessages.json';
import { findEntries, insert } from '~/database/DecryptedAmountsDao';
import decryptTransactions, {
    isSuccessfulEncryptedTransaction,
} from '~/utils/decryptHelpers';
import { getKeyExportType } from '~/utils/identityHelpers';

interface Props {
    account: Account;
    onDecrypt?: () => void;
}

/**
 * Wrapper around the Ledger component. Used for decrypting an account's
 * shielded balance, and any shielded transactions currently in the state
 * that have not been decrypted previously.
 */
export default function DecryptComponent({ account, onDecrypt }: Props) {
    const dispatch = useDispatch();
    const global = useSelector(globalSelector);
    const identity = useSelector(specificIdentitySelector(account.identityId));
    const shieldedTransactions = useSelector(
        shieldedTransactionsSelector
    ).filter(isSuccessfulEncryptedTransaction);

    async function ledgerCall(
        ledger: ConcordiumLedgerClient,
        setMessage: (message: string) => void
    ) {
        if (!global) {
            throw new Error(errorMessages.missingGlobal);
        }

        if (account.identityNumber === undefined) {
            throw new Error(
                'The account is missing an identity number. This is an internal error that should be reported'
            );
        }

        if (identity === undefined) {
            throw new Error(
                'The identity was not found. This is an internal error that should be reported'
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
        const { credentialNumber } = credential;

        setMessage('Please accept decrypt on device');
        const prfKeySeed = await ledger.getPrfKeyDecrypt(
            credential.identityNumber,
            getKeyExportType(identity.version)
        );
        setMessage('Please wait');
        const prfKey = prfKeySeed.toString('hex');

        // Determine which transactions we have not already decrypted, and decrypt only those.
        const decryptedAmountHashes = (
            await findEntries(
                shieldedTransactions.map((t) => t.transactionHash)
            )
        ).map((r) => r.transactionHash);
        const missingDecryptedAmount = shieldedTransactions.filter(
            (t) => !decryptedAmountHashes.includes(t.transactionHash)
        );
        const decryptedTransactions = await decryptTransactions(
            missingDecryptedAmount,
            account.address,
            prfKey,
            identity.version,
            credentialNumber,
            global
        );

        for (const transaction of decryptedTransactions) {
            await insert({
                transactionHash: transaction.transactionHash,
                amount: transaction.decryptedAmount,
            });
        }

        await decryptAccountBalance(
            account,
            prfKey,
            identity.version,
            credentialNumber,
            global,
            dispatch
        );

        // Update the state to include the newly decrypted amounts.
        for (const decryptedTransaction of decryptedTransactions) {
            const update = {
                decryptedAmount: decryptedTransaction.decryptedAmount,
            };
            dispatch(
                updateTransactionFields({
                    hash: decryptedTransaction.transactionHash,
                    updatedFields: update,
                })
            );
        }

        if (onDecrypt) {
            onDecrypt();
        }
    }

    return (
        <Ledger ledgerCallback={ledgerCall}>
            {({ isReady, statusView, submitHandler = asyncNoOp }) => (
                <Card className="flexColumn textCenter">
                    <h3 className="mB40">Decrypt shielded balance</h3>
                    {statusView}
                    <Button
                        size="big"
                        disabled={!isReady}
                        className="m40"
                        onClick={submitHandler}
                    >
                        Decrypt
                    </Button>
                </Card>
            )}
        </Ledger>
    );
}
