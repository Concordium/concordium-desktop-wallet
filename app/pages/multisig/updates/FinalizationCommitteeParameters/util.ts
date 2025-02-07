import { ChainParametersV2, ChainParametersV3 } from '@concordium/web-sdk';
import updateConstants from '~/constants/updateConstants.json';

export interface FinalizationCommitteeParametersFields {
    minFinalizers: number;
    maxFinalizers: number;
    relativeStakeThresholdFraction: number;
}

export const fieldDisplays = {
    minFinalizers: 'Minimum number of finalizers',
    maxFinalizers: 'Maximum number of finalizers',
    relativeStakeThresholdFraction: 'Relative stake threshold',
};

export function getCurrentFinalizationCommitteeParameters(
    chainParameters: ChainParametersV2 | ChainParametersV3
): FinalizationCommitteeParametersFields {
    return {
        relativeStakeThresholdFraction:
            chainParameters.finalizerRelativeStakeThreshold *
            updateConstants.rewardFractionResolution,
        minFinalizers: chainParameters.minimumFinalizers,
        maxFinalizers: chainParameters.maximumFinalizers,
    };
}
