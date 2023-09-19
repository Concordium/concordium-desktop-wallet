import {
    ChainParameters,
    ChainParametersV0,
    ChainParametersV1,
    isChainParametersV0,
    isChainParametersV1,
} from '@concordium/web-sdk';

export function getMinimumStakeForBaking(
    chainParameters: ChainParameters
): bigint {
    if (isChainParametersV0(chainParameters)) {
        return chainParameters.minimumThresholdForBaking;
    }
    return chainParameters.minimumEquityCapital;
}

export function isChainParametersV2OrHigher(
    chainParameters: ChainParameters
): chainParameters is Exclude<
    ChainParameters,
    ChainParametersV0 | ChainParametersV1
> {
    return (
        !isChainParametersV0(chainParameters) &&
        !isChainParametersV1(chainParameters)
    );
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
