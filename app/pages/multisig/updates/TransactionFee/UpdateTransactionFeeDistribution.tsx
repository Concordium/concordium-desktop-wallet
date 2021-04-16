import React from 'react';

import { Validate } from 'react-hook-form';
import { EqualRecord } from '~/utils/types';
import { UpdateProps } from '~/utils/transactionTypes';
import {
    RewardDistributionValue,
    FormRewardDistribution,
    RewardDistribution,
} from '../../common/RewardDistribution';
import { getCurrentValue, rewardDistributionLabels } from './util';

export interface UpdateTransactionFeeDistributionFields {
    rewardDistribution: RewardDistributionValue;
}

const fieldNames: EqualRecord<UpdateTransactionFeeDistributionFields> = {
    rewardDistribution: 'rewardDistribution',
};

export default function UpdateTransactionFeeDistribution({
    blockSummary,
}: UpdateProps) {
    const currentValue: RewardDistributionValue = getCurrentValue(blockSummary);
    const notEqual: Validate = (value: RewardDistributionValue) =>
        value.first !== currentValue.first ||
        value.second !== currentValue.second ||
        "Value hasn't changed";

    return (
        <>
            <div>
                <h5>Current Transaction Fee Distribuition</h5>
                <RewardDistribution
                    value={currentValue}
                    labels={rewardDistributionLabels}
                    disabled
                />
            </div>
            <div>
                <h5>New Transaction Fee Distribuition</h5>
                <FormRewardDistribution
                    name={fieldNames.rewardDistribution}
                    defaultValue={currentValue}
                    labels={rewardDistributionLabels}
                    rules={{
                        required: 'Must specify reward distribution',
                        validate: { notEqual },
                    }}
                />
            </div>
        </>
    );
}
