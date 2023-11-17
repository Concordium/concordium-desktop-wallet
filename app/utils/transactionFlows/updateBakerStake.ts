import { ConfigureBakerFlowState } from './configureBaker';

export const updateBakerStakeTitle = 'Update validator stake';

export type UpdateBakerStakeFlowState = Pick<ConfigureBakerFlowState, 'stake'>;
