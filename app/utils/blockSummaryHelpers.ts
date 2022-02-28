/* eslint-disable import/prefer-default-export */
import { isBlockSummaryV1 } from '@concordium/node-sdk/lib/src/blockSummaryHelpers';
import { BlockSummary } from '~/node/NodeApiTypes';

export function getMinimumStakeForBaking(bs: BlockSummary): bigint {
    if (isBlockSummaryV1(bs)) {
        return bs.updates.chainParameters.minimumEquityCapital;
    }

    return bs.updates.chainParameters.minimumThresholdForBaking;
}
