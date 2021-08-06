import { BlockSummary } from '@concordium/node-sdk';
import { MintEvent } from '~/node/NodeApiTypes';

// The type from node sdk does not have the specialEvents property, but we need
// it, until we have a better way to access the foundationAccount.
interface BlockSummaryWithSpecialEvent extends BlockSummary {
    specialEvents: [MintEvent];
}

// TODO We should not get the current foundation address from this field, as it is
// kind of hacky. The current API does not support a better solution, but when it does
// we should update this extraction.
// eslint-disable-next-line import/prefer-default-export
export const getCurrentValue = (blockSummary: BlockSummary) =>
    (blockSummary as BlockSummaryWithSpecialEvent).specialEvents[0]
        .foundationAccount;
