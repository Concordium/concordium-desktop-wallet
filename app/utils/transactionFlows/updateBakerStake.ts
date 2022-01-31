import { AccountInfo } from '@concordium/node-sdk';
import { microGtuToGtu } from '../gtu';
import { ConfigureBakerFlowState, StakeSettings } from './configureBaker';

export const title = 'Update baker stake';

export type UpdateBakerStakeFlowState = Pick<ConfigureBakerFlowState, 'stake'>;

export const getExistingValues = (info: AccountInfo): StakeSettings => ({
    stake: microGtuToGtu(info.accountBaker?.stakedAmount) ?? '1000.00', // TODO: change default to 0.
    restake: info.accountBaker?.restakeEarnings ?? true,
});
