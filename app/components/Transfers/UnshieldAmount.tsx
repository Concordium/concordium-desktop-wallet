import React from 'react';
import routes from '~/constants/routes.json';
import { createUnshieldAmountTransaction } from '~/utils/transactionHelpers';
import { Account, TransactionKindId } from '~/utils/types';
import InternalTransfer from './InternalTransfer';

interface Props {
    account: Account;
    disableClose?: boolean;
}

/**
 * Controls the flow of creating a transfer to public.
 */
export default function UnshieldAmount({
    account,
    disableClose = false,
}: Props) {
    const specific = {
        amountHeader: 'Unshield GTU',
        createTransaction: createUnshieldAmountTransaction,
        location: routes.ACCOUNTS_UNSHIELDAMOUNT,
        transactionKind: TransactionKindId.Transfer_to_public,
    };

    return (
        <InternalTransfer
            account={account}
            specific={specific}
            disableClose={disableClose}
        />
    );
}
