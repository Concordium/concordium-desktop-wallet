import {
    ChainParameters,
    ChainParametersV0,
    ChainParametersV1,
} from '@concordium/web-sdk';

export function getMinimumStakeForBaking(
    chainParameters: ChainParameters
): bigint {
    if (chainParameters.version === 0) {
        return chainParameters.minimumThresholdForBaking.microCcdAmount;
    }
    return chainParameters.minimumEquityCapital.microCcdAmount;
}

export function isChainParametersV2OrHigher(
    chainParameters: ChainParameters
): chainParameters is Exclude<
    ChainParameters,
    ChainParametersV0 | ChainParametersV1
> {
    return chainParameters.version >= 2;
}

/**
 * Checks that the given chainParameters are version 2 or above.
 * If the given parameters are version 0 or 1, this throws.
 */
export function assertChainParametersV2OrHigher(
    chainParameters: ChainParameters,
    errorMessage = 'Connected node used outdated chainParameters format'
): asserts chainParameters is Exclude<
    ChainParameters,
    ChainParametersV0 | ChainParametersV1
> {
    if (!isChainParametersV2OrHigher(chainParameters)) {
        throw new Error(errorMessage);
    }
}
