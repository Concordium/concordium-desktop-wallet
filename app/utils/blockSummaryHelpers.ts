/* eslint-disable import/prefer-default-export */
import { isChainParametersV0 } from '@concordium/web-sdk';
import { ChainParameters } from '~/node/NodeApiTypes';

export function getMinimumStakeForBaking(
    chainParameters: ChainParameters
): bigint {
    if (isChainParametersV0(chainParameters)) {
        return chainParameters.minimumThresholdForBaking;
    }
    return chainParameters.minimumEquityCapital;
}
