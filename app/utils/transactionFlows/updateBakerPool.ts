import { ExchangeRate } from '~/components/Transfers/withExchangeRate';
import { AccountAndNonce } from '~/components/Transfers/withNonce';
import { NotOptional } from '../types';
import { ConfigureBakerFlowState } from './configureBaker';

export const title = 'Update baker pool';

export type Dependencies = NotOptional<ExchangeRate & AccountAndNonce>;

export type UpdateBakerPoolFlowState = Pick<
    ConfigureBakerFlowState,
    'openForDelegation' | 'commissions' | 'metadataUrl'
>;
