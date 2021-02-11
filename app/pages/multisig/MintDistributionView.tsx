import React from 'react';
import { MintDistribution } from '../../utils/types';

interface Props {
    mintDistribution: MintDistribution;
}

/**
 * Displays an overview of a euro per energy transaction payload.
 */
export default function MintDistributionView({ mintDistribution }: Props) {
    return (
        <>
            Mint per slot: {mintDistribution.mintPerSlot}
            Baker reward fraction: {mintDistribution.bakingReward}
            Finalization reward fraction: {mintDistribution.finalizationReward}
        </>
    );
}
