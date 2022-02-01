import { ExchangeRate } from '~/components/Transfers/withExchangeRate';
import { NotOptional } from '../types';
import { ConfigureBakerFlowState } from './configureBaker';

export const updateBakerKeysTitle = 'Update baker keys';

export type UpdateBakerKeysDependencies = NotOptional<ExchangeRate>;
export type UpdateBakerKeysFlowState = Pick<ConfigureBakerFlowState, 'keys'>;
