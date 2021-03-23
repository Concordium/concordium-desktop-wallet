import React from 'react';
import { Grid, Progress } from 'semantic-ui-react';

import { ColorType, EqualRecord } from '~/utils/types';
import { rewardFractionResolution } from '~/constants/updateConstants.json';
import { UpdateProps } from '~/utils/transactionTypes';
import {
    RewardDistributionValue,
    FormRewardDistribution,
} from './common/RewardDistribution';

export interface UpdateTransactionFeeDistributionFields {
    rewardDistribution: RewardDistributionValue;
}

const fieldNames: EqualRecord<UpdateTransactionFeeDistributionFields> = {
    rewardDistribution: 'rewardDistribution',
};

const rewardDistributionLabels: [string, string, string] = [
    'Baker Reward',
    'Next Gas Account',
    'Foundation',
];

export default function UpdateTransactionFeeDistribution({
    blockSummary,
}: UpdateProps) {
    const currentBakerFee =
        blockSummary.updates.chainParameters.rewardParameters
            .transactionFeeDistribution.baker;
    const currentGasAccountFee =
        blockSummary.updates.chainParameters.rewardParameters
            .transactionFeeDistribution.gasAccount;
    const initialValue: RewardDistributionValue = {
        first: currentBakerFee,
        second: currentGasAccountFee,
    };

    // const currentBakerFee =
    //     blockSummary.updates.chainParameters.rewardParameters
    //         .transactionFeeDistribution.baker * rewardFractionResolution;
    // const currentGasAccountFee =
    //     blockSummary.updates.chainParameters.rewardParameters
    //         .transactionFeeDistribution.gasAccount * rewardFractionResolution;
    // const foundationShare =
    //     rewardFractionResolution - (currentBakerFee + currentGasAccountFee);

    // let newFoundationShare;
    // if (transactionFeeDistribution) {
    //     newFoundationShare =
    //         rewardFractionResolution -
    //         (transactionFeeDistribution?.baker +
    //             transactionFeeDistribution?.gasAccount);
    // }

    // function updateTransactionFee(
    //     inputValue: string,
    //     property: keyof TransactionFeeDistribution,
    //     distribution: TransactionFeeDistribution
    // ) {
    //     if (inputValue) {
    //         let value;
    //         try {
    //             value = parseInt(inputValue, 10);
    //         } catch (error) {
    //             // Input not a valid integer. Do nothing.
    //             return;
    //         }

    //         const updatedTransactionFeeDistribution = {
    //             ...distribution,
    //         };
    //         updatedTransactionFeeDistribution[property] = value;
    //         setTransactionFeeDistribution(updatedTransactionFeeDistribution);
    //     }
    // }

    // if (!transactionFeeDistribution) {
    //     setTransactionFeeDistribution({
    //         baker: currentBakerFee,
    //         gasAccount: currentGasAccountFee,
    //     });
    //     return null;
    // }

    return (
        <>
            <Grid columns={2}>
                <Grid.Column>
                    <Progress
                        value={currentBakerFee}
                        total={rewardFractionResolution}
                        progress="percent"
                        label="Current baker reward"
                        color={ColorType.Blue}
                    />
                    <Progress
                        value={currentGasAccountFee}
                        total={rewardFractionResolution}
                        progress="percent"
                        label="Current GAS account share"
                        color={ColorType.Teal}
                    />
                    {/* <Progress
                        value={foundationShare}
                        total={rewardFractionResolution}
                        progress="percent"
                        label="Current foundation share"
                        color={ColorType.Grey}
                    /> */}
                </Grid.Column>
                <Grid.Column>
                    <h3>New Transaction Fee Distribuition</h3>
                    <FormRewardDistribution
                        name={fieldNames.rewardDistribution}
                        defaultValue={initialValue}
                        labels={rewardDistributionLabels}
                        rules={{ required: 'Must specify reward distribution' }}
                    />
                </Grid.Column>
            </Grid>
        </>
    );
}
