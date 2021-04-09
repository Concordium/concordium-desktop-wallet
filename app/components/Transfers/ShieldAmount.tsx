import React from 'react';
import routes from '../../constants/routes.json';
import { createShieldAmountTransaction } from '../../utils/transactionHelpers';
import InternalTransfer from './InternalTransfer';
import { Account } from '../../utils/types';

interface Props {
    account: Account;
}

/**
 * Controls the flow of creating a transfer to encrypted.
 */
export default function ShieldAmount({ account }: Props) {
    const specific = {
        amountHeader: 'Shield Amount',
        createTransaction: createShieldAmountTransaction,
        location: routes.ACCOUNTS_SHIELDAMOUNT,
    };

    return <InternalTransfer account={account} specific={specific} />;
}
