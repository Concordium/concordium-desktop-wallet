import React from 'react';
import routes from '~/constants/routes.json';
import { createUnshieldAmountTransaction } from '~/utils/transactionHelpers';
import { Account, TransactionKindId } from '~/utils/types';
import InternalTransfer from './InternalTransfer';

interface Props {
    account: Account;
}

/**
 * Controls the flow of creating a transfer to public.
 */
export default function UnshieldAmount({ account }: Props) {
    const specific = {
        amountHeader: 'Unshield Amount',
        createTransaction: createUnshieldAmountTransaction,
        location: routes.ACCOUNTS_UNSHIELDAMOUNT,
        transactionKind: TransactionKindId.Transfer_to_public,
    };

    return <InternalTransfer account={account} specific={specific} />;
}
