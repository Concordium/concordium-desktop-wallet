import { ExchangeRate } from '~/components/Transfers/withExchangeRate';
import { isDefined } from '../basicHelpers';
import {
    Account,
    AccountInfo,
    ConfigureBaker,
    Fraction,
    MakeRequired,
    NotOptional,
    OpenStatus,
} from '../types';
import { ChainData } from '../withChainData';
import {
    ConfigureBakerFlowState,
    convertToBakerTransaction,
    getExistingBakerValues,
} from './configureBaker';

export const updateBakerPoolTitle = 'Update staking pool';

export type UpdateBakerPoolDependencies = NotOptional<ExchangeRate> &
    NotOptional<ChainData>;

export type UpdateBakerPoolFlowState = MakeRequired<
    Pick<
        ConfigureBakerFlowState,
        'openForDelegation' | 'commissions' | 'metadataUrl'
    >,
    'openForDelegation'
>;

export const getSanitizedBakerPoolValues = (
    values: ConfigureBakerFlowState,
    accountInfo: AccountInfo | undefined
) => {
    if (!isDefined(accountInfo)) {
        return values;
    }

    const existing = getExistingBakerValues(accountInfo) ?? {};
    const sanitized = { ...values };

    if (values.openForDelegation === OpenStatus.ClosedForAll) {
        sanitized.commissions = existing.commissions;
    }

    return sanitized;
};

export const convertToUpdateBakerPoolTransaction = (
    account: Account,
    nonce: bigint,
    exchangeRate: Fraction,
    accountInfo: AccountInfo
) => (values: UpdateBakerPoolFlowState, expiry?: Date): ConfigureBaker => {
    const sanitized = getSanitizedBakerPoolValues(values, accountInfo);

    return convertToBakerTransaction(
        account,
        nonce,
        exchangeRate,
        accountInfo
    )(sanitized, expiry);
};
