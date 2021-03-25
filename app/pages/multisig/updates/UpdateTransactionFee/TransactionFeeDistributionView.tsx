import React from 'react';
import { TransactionFeeDistribution } from '~/utils/types';
import {
    RewardDistribution,
    RewardDistributionValue,
} from '../../common/RewardDistribution';
import { rewardDistributionLabels } from './util';

interface Props {
    transactionFeeDistribution: TransactionFeeDistribution;
}

/**
 * Displays an overview of a transaction fee distribution transaction payload.
 */
export default function SignTransactionFeeDistribution({
    transactionFeeDistribution: { baker, gasAccount },
}: Props) {
    const value: RewardDistributionValue = {
        first: baker,
        second: gasAccount,
    };
    return (
        <>
            <h5>New Transaction Fee Distribution</h5>
            <RewardDistribution
                value={value}
                labels={rewardDistributionLabels}
                disabled
            />
        </>
    );
}
