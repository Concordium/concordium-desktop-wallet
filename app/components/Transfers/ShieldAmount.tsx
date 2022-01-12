import React from 'react';
import routes from '~/constants/routes.json';
import { createShieldAmountTransaction } from '~/utils/transactionHelpers';
import InternalTransfer from './InternalTransfer';
import { Account, TransactionKindId } from '~/utils/types';

interface Props {
    account: Account;
    disableClose?: boolean;
}

/**
 * Controls the flow of creating a transfer to encrypted.
 */
export default function ShieldAmount({ account, disableClose = false }: Props) {
    const specific = {
        amountHeader: 'Shield CCD',
        createTransaction: createShieldAmountTransaction,
        location: routes.ACCOUNTS_SHIELDAMOUNT,
        transactionKind: TransactionKindId.Transfer_to_encrypted,
    };

    return (
        <InternalTransfer
            account={account}
            specific={specific}
            disableClose={disableClose}
        />
    );
}
