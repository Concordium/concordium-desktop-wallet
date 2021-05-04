import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loadAccounts, decryptAccountBalance } from '~/features/AccountSlice';
import { globalSelector } from '~/features/GlobalSlice';
import {
    transactionsSelector,
    decryptTransactions,
    loadTransactions,
} from '~/features/TransactionSlice';
import { Account } from '~/utils/types';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import Ledger from '~/components/ledger/Ledger';
import { getCredentialsOfAccount } from '~/database/CredentialDao';
import { asyncNoOp } from '~/utils/basicHelpers';
import Card from '~/cross-app-components/Card';
import Button from '~/cross-app-components/Button';

interface Props {
    account: Account;
}

/**
 * Wrapper for the ledger component, for decrypting the account'
 * shielded balance and transactions.
 */
export default function DecryptComponent({ account }: Props) {
    const dispatch = useDispatch();
    const transactions = useSelector(transactionsSelector);
    const global = useSelector(globalSelector);

    async function ledgerCall(
        ledger: ConcordiumLedgerClient,
        setMessage: (message: string) => void
    ) {
        if (!global) {
            throw new Error('Unexpected missing global object');
        }
        setMessage('Please confirm exporting prf key on device');
        const prfKeySeed = await ledger.getPrfKey(account.identityId);
        setMessage('Please wait');
        const prfKey = prfKeySeed.toString('hex');

        const credentialNumber = (
            await getCredentialsOfAccount(account.address)
        ).find((cred) => cred.credentialIndex === 0)?.credentialNumber;

        if (credentialNumber === undefined) {
            throw new Error(
                'Unable to decrypt amounts, because we were unable to find original credential'
            );
        }
        await decryptAccountBalance(prfKey, account, credentialNumber, global);
        await decryptTransactions(
            transactions,
            prfKey,
            credentialNumber,
            global
        );
        await loadTransactions(account, dispatch);
        await loadAccounts(dispatch);
    }

    return (
        <Ledger ledgerCallback={ledgerCall}>
            {({ isReady, statusView, submitHandler = asyncNoOp }) => (
                <Card className="flexColumn">
                    <h3 className="textCenter mB40">
                        Decrypt shielded balance
                    </h3>
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
