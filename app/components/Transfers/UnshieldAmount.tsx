import React from 'react';
import { AccountTransactionType } from '@concordium/node-sdk';
import routes from '~/constants/routes.json';
import { createUnshieldAmountTransaction } from '~/utils/transactionHelpers';
import { Account } from '~/utils/types';
import InternalTransfer from './InternalTransfer';

interface Props {
    account: Account;
}

/**
 * Controls the flow of creating a transfer to public.
 */
export default function UnshieldAmount({ account }: Props) {
    const specific = {
        amountHeader: 'Unshield GTU',
        createTransaction: createUnshieldAmountTransaction,
        location: routes.ACCOUNTS_UNSHIELDAMOUNT,
        transactionKind: AccountTransactionType.TransferToPublic,
    };

    return <InternalTransfer account={account} specific={specific} />;
}
