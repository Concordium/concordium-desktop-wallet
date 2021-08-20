import React from 'react';
import { AccountTransactionType } from '@concordium/node-sdk/lib/src/types';
import routes from '~/constants/routes.json';
import { createShieldAmountTransaction } from '~/utils/transactionHelpers';
import InternalTransfer from './InternalTransfer';
import { Account } from '~/utils/types';

interface Props {
    account: Account;
}

/**
 * Controls the flow of creating a transfer to encrypted.
 */
export default function ShieldAmount({ account }: Props) {
    const specific = {
        amountHeader: 'Shield GTU',
        createTransaction: createShieldAmountTransaction,
        location: routes.ACCOUNTS_SHIELDAMOUNT,
        transactionKind: AccountTransactionType.TransferToEncrypted,
    };

    return <InternalTransfer account={account} specific={specific} />;
}
