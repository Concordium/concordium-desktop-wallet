import React from 'react';

import { EqualRecord } from '~/utils/types';
import { UpdateProps } from '~/utils/transactionTypes';
import { rewardFractionResolution } from '~/constants/updateConstants.json';
import {
    RewardDistributionValue,
    FormRewardDistribution,
    RewardDistribution,
} from '../../common/RewardDistribution';
import { rewardDistributionLabels } from './util';

export interface UpdateTransactionFeeDistributionFields {
    rewardDistribution: RewardDistributionValue;
}

const fieldNames: EqualRecord<UpdateTransactionFeeDistributionFields> = {
    rewardDistribution: 'rewardDistribution',
};

export default function UpdateTransactionFeeDistribution({
    blockSummary,
}: UpdateProps) {
    const currentBakerFee =
        blockSummary.updates.chainParameters.rewardParameters
            .transactionFeeDistribution.baker * rewardFractionResolution;
    const currentGasAccountFee =
        blockSummary.updates.chainParameters.rewardParameters
            .transactionFeeDistribution.gasAccount * rewardFractionResolution;
    const currentValue: RewardDistributionValue = {
        first: currentBakerFee,
        second: currentGasAccountFee,
    };

    return (
        <>
            <div>
                <h5>Current Transaction Fee Distribuition</h5>
                <RewardDistribution
                    value={currentValue}
                    labels={rewardDistributionLabels}
                />
            </div>
            <div>
                <h5>New Transaction Fee Distribuition</h5>
                <FormRewardDistribution
                    name={fieldNames.rewardDistribution}
                    defaultValue={currentValue}
                    labels={rewardDistributionLabels}
                    rules={{ required: 'Must specify reward distribution' }}
                />
            </div>
        </>
    );
}
