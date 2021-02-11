import React from 'react';
import { Header, Progress } from 'semantic-ui-react';
import { ColorType, MintDistribution } from '../../utils/types';
import { rewardFractionResolution } from '../../constants/updateConstants.json';

interface Props {
    mintDistribution: MintDistribution;
}

/**
 * Displays an overview of a euro per energy transaction payload.
 */
export default function MintDistributionView({ mintDistribution }: Props) {
    return (
        <>
            <Header>Mint per slot</Header>
            {mintDistribution.mintPerSlot.mantissa} * 10^(-
            {mintDistribution.mintPerSlot.exponent})
            <Progress
                value={mintDistribution.bakingReward}
                total={rewardFractionResolution}
                progress="percent"
                label="Baking reward fraction"
                color={ColorType.Blue}
            />
            <Progress
                value={mintDistribution.finalizationReward}
                total={rewardFractionResolution}
                progress="percent"
                label="Finalization reward fraction"
                color={ColorType.Teal}
            />
            <Progress
                value={
                    rewardFractionResolution -
                    (mintDistribution.bakingReward +
                        mintDistribution.finalizationReward)
                }
                total={rewardFractionResolution}
                progress="percent"
                label="Foundation reward fraction"
                color={ColorType.Grey}
            />
        </>
    );
}
