import React from 'react';
import { AccountTransaction } from '~/utils/types';
import { displayAsGTU } from '~/utils/gtu';
import DisplayEstimatedFee from '~/components/DisplayEstimatedFee';

interface Props {
    transaction: AccountTransaction;
}

/**
 * Attempts to display the fee of the transaction, if not presents, used DisplayEstimatedFee as fallback
 */
export default function DisplayFee({ transaction }: Props) {
    if (transaction.cost) {
        return <p className="body4"> fee: {displayAsGTU(transaction.cost)} </p>;
    }
    return <DisplayEstimatedFee estimatedFee={transaction.estimatedFee} />;
}
