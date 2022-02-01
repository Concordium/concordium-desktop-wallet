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
import {
    ConfigureBakerFlowState,
    convertToTransaction as baseConvertToTransaction,
    getExistingValues,
} from './configureBaker';

export const title = 'Update baker pool';

export type Dependencies = NotOptional<ExchangeRate>;

export type UpdateBakerPoolFlowState = MakeRequired<
    Pick<
        ConfigureBakerFlowState,
        'openForDelegation' | 'commissions' | 'metadataUrl'
    >,
    'openForDelegation'
>;

export const getSanitizedValues = (
    values: ConfigureBakerFlowState,
    accountInfo: AccountInfo | undefined
) => {
    if (!isDefined(accountInfo)) {
        return values;
    }

    const existing = getExistingValues(accountInfo) ?? {};
    const sanitized = { ...values };

    if (values.openForDelegation === OpenStatus.ClosedForAll) {
        sanitized.commissions = existing.commissions;
        sanitized.metadataUrl = existing.metadataUrl;
    } else if (
        existing.metadataUrl === undefined &&
        values.metadataUrl === ''
    ) {
        delete sanitized.metadataUrl;
    }

    return sanitized;
};

export const convertToTransaction = (
    account: Account,
    nonce: bigint,
    exchangeRate: Fraction,
    accountInfo: AccountInfo
) => (values: ConfigureBakerFlowState): ConfigureBaker => {
    const sanitized = getSanitizedValues(values, accountInfo);

    return baseConvertToTransaction(
        account,
        nonce,
        exchangeRate,
        accountInfo
    )(sanitized);
};
