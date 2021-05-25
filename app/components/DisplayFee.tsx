import React from 'react';
import clsx from 'clsx';
import { AccountTransaction } from '~/utils/types';
import { displayAsGTU } from '~/utils/gtu';
import DisplayEstimatedFee from '~/components/DisplayEstimatedFee';

interface Props {
    className?: string;
    transaction: AccountTransaction;
}

/**
 * Attempts to display the fee of the transaction, if not presents, used DisplayEstimatedFee as fallback
 */
export default function DisplayFee({ className, transaction }: Props) {
    if (transaction.cost) {
        return (
            <p className={clsx('body4', className)}>
                {' '}
                fee: {displayAsGTU(transaction.cost)}{' '}
            </p>
        );
    }
    return (
        <DisplayEstimatedFee
            className={className}
            estimatedFee={transaction.estimatedFee}
        />
    );
}
