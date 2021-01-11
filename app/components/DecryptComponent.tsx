import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loadAccounts, decryptAccountBalance } from '../features/AccountSlice';
import {
    transactionsSelector,
    decryptTransactions,
    loadTransactions,
    viewingShieldedSelector,
} from '../features/TransactionSlice';
import LedgerComponent from './LedgerComponent';

interface Props {
    account: Account;
}

export default function DecryptComponent({ account }: Props) {
    const dispatch = useDispatch();
    const transactions = useSelector(transactionsSelector);
    const viewingShielded = useSelector(viewingShieldedSelector);

    async function ledgerCall(ledger, setMessage) {
        setMessage('Please confirm exporting prf key on device');
        const prfKeySeed = await ledger.getPrfKey(account.identityId);
        setMessage('Please wait');
        const prfKey = prfKeySeed.toString('hex');
        await decryptAccountBalance(dispatch, prfKey, account);
        await loadAccounts(dispatch);
        await decryptTransactions(transactions, prfKey, account);
        return loadTransactions(account, viewingShielded, dispatch);
    }

    return <LedgerComponent ledgerCall={ledgerCall} />;
}
