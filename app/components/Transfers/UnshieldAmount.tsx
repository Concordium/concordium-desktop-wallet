import React from 'react';
import routes from '~/constants/routes.json';
import { createUnshieldAmountTransaction } from '~/utils/transactionHelpers';
import { Account, TransactionKindId } from '~/utils/types';
import InternalTransfer from './InternalTransfer';
import ensureNoPendingShieldedBalance from './ensureNoPendingShieldedBalance';

interface Props {
    account: Account;
}

/**
 * Controls the flow of creating a transfer to public.
 */
function UnshieldAmount({ account }: Props) {
    const specific = {
        amountHeader: 'Unshield GTU',
        createTransaction: createUnshieldAmountTransaction,
        location: routes.ACCOUNTS_UNSHIELDAMOUNT,
        transactionKind: TransactionKindId.Transfer_to_public,
    };

    return <InternalTransfer account={account} specific={specific} />;
}

export default ensureNoPendingShieldedBalance(UnshieldAmount);
