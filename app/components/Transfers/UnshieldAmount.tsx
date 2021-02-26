import React from 'react';
import routes from '../../constants/routes.json';
import { Account } from '../../utils/types';
import { createUnshieldAmountTransaction } from '../../utils/transactionHelpers';
import InternalTransfer from './InternalTransfer';

interface Props {
    account: Account;
}

/**
 * Controls the flow of creating a simple transfer.
 */
export default function ShieldAmount({ account }: Props) {
    const specific = {
        title: 'Unshield Amount',
        amountHeader: '',
        createTransaction: createUnshieldAmountTransaction,
        location: routes.ACCOUNTS_UNSHIELDAMOUNT,
    };

    return <InternalTransfer account={account} specific={specific} />;
}
