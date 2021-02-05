import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    loadAccounts,
    decryptAccountBalance,
} from '../../features/AccountSlice';
import {
    transactionsSelector,
    decryptTransactions,
    loadTransactions,
    viewingShieldedSelector,
} from '../../features/TransactionSlice';
import { Account } from '../../utils/types';
import ConcordiumLedgerClient from '../../features/ledger/ConcordiumLedgerClient';
import LedgerComponent from '../../components/ledger/LedgerComponent';

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

    if (!viewingShielded || account.allDecrypted) {
        return null;
    }

    async function ledgerCall(
        ledger: ConcordiumLedgerClient,
        setMessage: (message: string) => void
    ) {
        setMessage('Please confirm exporting prf key on device');
        const prfKeySeed = await ledger.getPrfKey(account.identityId);
        setMessage('Please wait');
        const prfKey = prfKeySeed.toString('hex');
        await decryptAccountBalance(prfKey, account);
        await decryptTransactions(transactions, prfKey, account);
        await loadTransactions(account, viewingShielded, dispatch);
        return loadAccounts(dispatch);
    }

    return <LedgerComponent ledgerCall={ledgerCall} />;
}
