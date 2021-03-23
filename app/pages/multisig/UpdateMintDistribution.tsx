import React from 'react';
import { Grid, Header, Progress, Segment } from 'semantic-ui-react';
import { Validate } from 'react-hook-form';

import { ColorType, EqualRecord, MintRate } from '~/utils/types';
import { UpdateProps } from '~/utils/transactionTypes';
import { rewardFractionResolution } from '~/constants/updateConstants.json';
import Form from '~/components/Form';

import {
    RewardDistributionValue,
    FormRewardDistribution,
} from './common/RewardDistribution';

export interface UpdateMintDistributionFields {
    mantissa: string;
    exponent: string;
    rewardDistribution: RewardDistributionValue;
}

const fieldNames: EqualRecord<UpdateMintDistributionFields> = {
    mantissa: 'mantissa',
    exponent: 'exponent',
    rewardDistribution: 'rewardDistribution',
};

const isValidNumber = (parseFun: (v: string) => number): Validate => (
    v: string
) => !Number.isNaN(parseFun(v)) || 'Value must be a valid number';

const isValidFloat = isValidNumber(parseFloat);
const isValidInteger = isValidNumber((v) => parseInt(v, 10));

const rewardDistributionLabels: [string, string, string] = [
    'Baking Reward Account',
    'Finalization Account Reward',
    'Foundation',
];

/**
 * Component for creating an update mint distribution transaction.
 */
export default function UpdateMintDistribution({
    blockSummary,
}: UpdateProps): JSX.Element | null {
    const currentMintDistribution =
        blockSummary.updates.chainParameters.rewardParameters.mintDistribution;

    // TODO Parse the current mint distribution value instead of hardcording this value.
    const mintRate: MintRate = {
        mantissa: 7555999,
        exponent: 16,
    };

    const initialValue: RewardDistributionValue = {
        first: currentMintDistribution.bakingReward,
        second: currentMintDistribution.finalizationReward,
    };

    return (
        <>
            <Grid columns="equal">
                <Grid.Column>
                    <Segment basic textAlign="center">
                        <Header size="small">Current mint rate</Header>
                        {currentMintDistribution.mintPerSlot}
                        <Progress
                            value={
                                currentMintDistribution.bakingReward *
                                rewardFractionResolution
                            }
                            total={rewardFractionResolution}
                            progress="percent"
                            label="Current baking reward fraction"
                            color={ColorType.Blue}
                        />
                        <Progress
                            value={
                                currentMintDistribution.finalizationReward *
                                rewardFractionResolution
                            }
                            total={rewardFractionResolution}
                            progress="percent"
                            label="Current finalization reward fraction"
                            color={ColorType.Teal}
                        />
                        <Progress
                            value={
                                rewardFractionResolution -
                                (currentMintDistribution.bakingReward +
                                    currentMintDistribution.finalizationReward) *
                                    rewardFractionResolution
                            }
                            total={rewardFractionResolution}
                            progress="percent"
                            label="Current foundation reward fraction"
                            color={ColorType.Grey}
                        />
                    </Segment>
                </Grid.Column>
                <Grid.Column>
                    <h3>New Mint Distribution</h3>
                    <Form.Input
                        name={fieldNames.mantissa}
                        label="Mantissa"
                        defaultValue={mintRate.mantissa}
                        rules={{
                            required: true,
                            validate: isValidFloat,
                            min: 0,
                        }}
                    />
                    <Form.Input
                        name={fieldNames.exponent}
                        label="Exponent"
                        defaultValue={mintRate.exponent}
                        rules={{
                            required: true,
                            validate: isValidInteger,
                            min: 0,
                        }}
                    />
                    <FormRewardDistribution
                        name={fieldNames.rewardDistribution}
                        defaultValue={initialValue}
                        labels={rewardDistributionLabels}
                        rules={{ required: 'Reward distribution is required' }}
                    />
                </Grid.Column>
            </Grid>
        </>
    );
}
