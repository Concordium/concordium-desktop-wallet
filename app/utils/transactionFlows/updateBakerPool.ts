import { ExchangeRate } from '~/components/Transfers/withExchangeRate';
import { AccountAndNonce } from '~/components/Transfers/withNonce';
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

export type Dependencies = NotOptional<ExchangeRate & AccountAndNonce>;

export type UpdateBakerPoolFlowState = MakeRequired<
    Pick<
        ConfigureBakerFlowState,
        'openForDelegation' | 'commissions' | 'metadataUrl'
    >,
    'openForDelegation'
>;

export const convertToTransaction = (
    account: Account,
    nonce: bigint,
    exchangeRate: Fraction,
    accountInfo: AccountInfo
) => (values: ConfigureBakerFlowState): ConfigureBaker => {
    const existing = getExistingValues(accountInfo) ?? {};
    const sanitized = { ...values };

    if (values.openForDelegation === OpenStatus.ClosedForAll) {
        // Ensure existing values are used if OpenStatus is closed.
        // Ensure metadata Url can be deleted (leave as empty string to do this)
        sanitized.commissions = existing.commissions;
        sanitized.metadataUrl = existing.metadataUrl;
    } else if (
        existing.metadataUrl === undefined &&
        values.metadataUrl === ''
    ) {
        delete sanitized.metadataUrl;
    }

    return baseConvertToTransaction(
        account,
        nonce,
        exchangeRate,
        accountInfo
    )(sanitized);
};
