import React from 'react';
import Loading from '~/cross-app-components/Loading';
import { TransactionFeeDistribution } from '~/utils/types';
import {
    RewardDistribution,
    RewardDistributionValue,
} from '../../common/RewardDistribution';
import withBlockSummary, {
    WithBlockSummary,
} from '../../common/withBlockSummary';
import { getCurrentValue, rewardDistributionLabels } from './util';

interface Props extends WithBlockSummary {
    transactionFeeDistribution: TransactionFeeDistribution;
}

/**
 * Displays an overview of a transaction fee distribution transaction payload.
 */
function SignTransactionFeeDistribution({
    transactionFeeDistribution: { baker, gasAccount },
    blockSummary,
}: Props) {
    const value: RewardDistributionValue = {
        first: baker,
        second: gasAccount,
    };

    return (
        <>
            <div className="mB50">
                <h5>Current Transaction Fee Distribution</h5>
                {blockSummary ? (
                    <RewardDistribution
                        value={getCurrentValue(blockSummary)}
                        labels={rewardDistributionLabels}
                        disabled
                    />
                ) : (
                    <Loading inline />
                )}
            </div>
            <div className="mB50">
                <h5>New Transaction Fee Distribution</h5>
                <RewardDistribution
                    value={value}
                    labels={rewardDistributionLabels}
                    disabled
                />
            </div>
        </>
    );
}

export default withBlockSummary(SignTransactionFeeDistribution);
