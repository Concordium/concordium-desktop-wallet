import { BlockSummary } from '~/node/NodeApiTypes';

// TODO We should not get the current foundation address from this field, as it is
// kind of hacky. The current API does not support a better solution, but when it does
// we should update this extraction.
// eslint-disable-next-line import/prefer-default-export
export const getCurrentValue = (blockSummary: BlockSummary) =>
    blockSummary.specialEvents[0].foundationAccount;
