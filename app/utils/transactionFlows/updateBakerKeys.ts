import { ExchangeRate } from '~/components/Transfers/withExchangeRate';
import { NotOptional } from '../types';
import { ConfigureBakerFlowState } from './configureBaker';

export const title = 'Update baker keys';

export type Dependencies = NotOptional<ExchangeRate>;
export type UpdateBakerKeysFlowState = Pick<ConfigureBakerFlowState, 'keys'>;
