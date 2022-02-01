import { ConfigureBakerFlowState } from './configureBaker';

export const updateBakerStakeTitle = 'Update baker stake';

export type UpdateBakerStakeFlowState = Pick<ConfigureBakerFlowState, 'stake'>;
