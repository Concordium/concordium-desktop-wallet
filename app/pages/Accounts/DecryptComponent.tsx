import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { decryptAccountBalance } from '~/features/AccountSlice';
import { globalSelector } from '~/features/GlobalSlice';
import {
    reloadTransactions,
    shieldedTransactionsSelector,
} from '~/features/TransactionSlice';
import {
    Account,
    Global,
    TransactionKindString,
    TransferTransaction,
} from '~/utils/types';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import Ledger from '~/components/ledger/Ledger';
import { asyncNoOp } from '~/utils/basicHelpers';
import Card from '~/cross-app-components/Card';
import Button from '~/cross-app-components/Button';
import findLocalDeployedCredentialWithWallet from '~/utils/credentialHelper';
import errorMessages from '~/constants/errorMessages.json';
import { findEntries, insert } from '~/database/DecryptedAmountsDao';
import { decryptAmounts } from '~/utils/rustInterface';

interface Props {
    account: Account;
    onDecrypt?: () => void;
}

/**
 * Decrypts the encrypted transfers in the provided transaction list. This is
 * done by using the provided PRF key, which has to belong to the corresponding
 * receiver account.
 *
 * Note: If the PRF key and account mismatches, then this method
 * will run indefinitely.
 * @param encryptedTransfers the encrypted transfers to decrypt
 * @param the account that the transactions are for
 * @param prfKey the PRF key that matches the account
 * @param credentialNumber the credential number to decrypt for
 * @param global the global cryptographic parameters for the chain
 */
async function decryptTransactions(
    encryptedTransfers: TransferTransaction[],
    accountAddress: string,
    prfKey: string,
    credentialNumber: number,
    global: Global
) {
    const encryptedAmounts = encryptedTransfers.map((t) => {
        if (!t.encrypted) {
            throw new Error(
                `One of the provided transfers did not contain an encrypted amount: ${t.transactionHash}`
            );
        } else if (t.fromAddress === accountAddress) {
            return JSON.parse(t.encrypted).inputEncryptedAmount;
        }
        return JSON.parse(t.encrypted).encryptedAmount;
    });

    const decryptedAmounts = await decryptAmounts(
        encryptedAmounts,
        credentialNumber,
        global,
        prfKey
    );

    return encryptedTransfers.map((transaction, index) => {
        return {
            ...transaction,
            decryptedAmount: decryptedAmounts[index],
        };
    });
}

/**
 * Wrapper around the Ledger component. Used for decrypting an account's
 * shielded balance, and any shielded transactions currently in the state
 * that have not been decrypted previously.
 */
export default function DecryptComponent({ account, onDecrypt }: Props) {
    const dispatch = useDispatch();
    const global = useSelector(globalSelector);
    const shieldedTransactions = useSelector(
        shieldedTransactionsSelector
    ).filter((t) =>
        [
            TransactionKindString.EncryptedAmountTransfer,
            TransactionKindString.EncryptedAmountTransferWithMemo,
        ].includes(t.transactionKind)
    );

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
            credential.identityNumber
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
            prfKey,
            account,
            credentialNumber,
            global,
            dispatch
        );

        // Reload the transaction log if we decrypted any transactions, so that they will
        // be reloaded with their decrypted amounts present.
        // TODO Instead of reloading (which queries the wallet proxy for no reason), we should
        // update the state directly with the decryptedAmounts.
        if (decryptedTransactions.length > 0) {
            dispatch(reloadTransactions());
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
