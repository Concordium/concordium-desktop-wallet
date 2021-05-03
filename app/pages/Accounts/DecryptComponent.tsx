import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    loadAccounts,
    decryptAccountBalance,
} from '../../features/AccountSlice';
import { globalSelector } from '../../features/GlobalSlice';
import {
    transactionsSelector,
    decryptTransactions,
    loadTransactions,
    viewingShieldedSelector,
} from '../../features/TransactionSlice';
import { Account } from '../../utils/types';
import ConcordiumLedgerClient from '../../features/ledger/ConcordiumLedgerClient';
import SimpleLedger from '../../components/ledger/SimpleLedger';
import findLocalDeployedCredentialWithWallet from '~/utils/credentialHelper';

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
    const viewingShielded = useSelector(viewingShieldedSelector);
    const global = useSelector(globalSelector);

    if (!viewingShielded || account.allDecrypted) {
        return null;
    }

    async function ledgerCall(
        ledger: ConcordiumLedgerClient,
        setMessage: (message: string) => void
    ) {
        if (!global) {
            throw new Error('Unexpected missing global object');
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
        const credentialNumber = credential?.credentialNumber;
        if (credentialNumber === undefined) {
            throw new Error(
                'Unable to decrypt shielded balance and encrypted transfers. Please verify that the connected wallet is for this account.'
            );
        }

        setMessage('Please confirm exporting PRF key on device');
        const prfKeySeed = await ledger.getPrfKey(account.identityNumber);
        setMessage('Please wait');
        const prfKey = prfKeySeed.toString('hex');

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

    return <SimpleLedger ledgerCall={ledgerCall} />;
}
