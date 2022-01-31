import { ConfigureBakerFlowState } from './configureBaker';

export const title = 'Update baker stake';

export type UpdateBakerStakeFlowState = Pick<ConfigureBakerFlowState, 'stake'>;
