/* eslint-disable import/prefer-default-export */
import { isBlockSummaryV0 } from '@concordium/node-sdk/lib/src/blockSummaryHelpers';
import { BlockSummary } from '~/node/NodeApiTypes';

export function getMinimumStakeForBaking(bs: BlockSummary): bigint {
    if (isBlockSummaryV0(bs)) {
        return bs.updates.chainParameters.minimumThresholdForBaking;
    }
    return bs.updates.chainParameters.minimumEquityCapital;
}
