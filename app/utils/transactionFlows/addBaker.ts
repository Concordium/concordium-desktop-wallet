import { AccountInfo } from '@concordium/web-sdk';
import { ValidateValues } from '~/components/MultiStepForm';
import { ChainParameters } from '~/node/NodeApiTypes';
import { collapseFraction } from '../basicHelpers';
import { getMinimumStakeForBaking } from '../blockSummaryHelpers';
import { getConfigureBakerFullCost } from '../transactionCosts';
import { validateBakerStake } from '../transactionHelpers';
import { serializeTransferPayload } from '../transactionSerialization';
import {
    Account,
    ConfigureBaker,
    ConfigureBakerPayload,
    Fraction,
    MakeOptional,
    MakeRequired,
    NotOptional,
    OpenStatus,
    TransactionKindId,
} from '../types';
import {
    Commissions,
    ConfigureBakerFlowState,
    toConfigureBakerPayload,
    convertToBakerTransaction,
} from './configureBaker';

export type AddBakerFlowState = MakeRequired<
    ConfigureBakerFlowState,
    'stake' | 'openForDelegation' | 'keys'
>;

export type AddBakerPayload = MakeOptional<
    NotOptional<ConfigureBakerPayload>,
    'metadataUrl'
>;

export const addBakerTitle = 'Register as a validator';

export const getSanitizedAddBakerValues = (
    values: Partial<AddBakerFlowState>,
    defaultCommissions: Commissions
) => {
    const sanitized = {
        ...values,
    };

    if (values.openForDelegation === OpenStatus.ClosedForAll) {
        // Ensure default pool settings are used when opting for closed pool.
        sanitized.metadataUrl = '';
        sanitized.commissions = defaultCommissions;
    }

    return sanitized;
};

export const convertToAddBakerTransaction = (
    defaultCommissions: Commissions,
    account: Account,
    nonce: bigint,
    exchangeRate: Fraction
) => (values: AddBakerFlowState, expiry?: Date): ConfigureBaker => {
    const sanitized = getSanitizedAddBakerValues(values, defaultCommissions);

    return convertToBakerTransaction(
        account,
        nonce,
        exchangeRate
    )(sanitized, expiry);
};

export function getEstimatedAddBakerFee(
    exchangeRate: Fraction,
    values?: ConfigureBakerFlowState,
    signatureThreshold = 1
) {
    const payloadSize =
        values === undefined
            ? undefined
            : serializeTransferPayload(
                  TransactionKindId.Configure_baker,
                  toConfigureBakerPayload(values)
              ).length;

    return getConfigureBakerFullCost(
        exchangeRate,
        signatureThreshold,
        payloadSize
    );
}

// As the payload of the transaction can vary a lot in size, we need to revalidate with all values, to check if account still has enough funds for the transaction.
export const validateAddBakerValues = (
    chainParameters: ChainParameters,
    account: Account,
    accountInfo: AccountInfo,
    exchangeRate: Fraction
): ValidateValues<AddBakerFlowState> => (values) => {
    const minimumStake = BigInt(getMinimumStakeForBaking(chainParameters));
    const estimatedFee = getEstimatedAddBakerFee(
        exchangeRate,
        values,
        account.signatureThreshold
    );
    const stakeValidationResult = validateBakerStake(
        minimumStake,
        values.stake.stake,
        accountInfo,
        estimatedFee && collapseFraction(estimatedFee)
    );

    if (stakeValidationResult !== undefined) {
        return 'stake';
    }

    return undefined;
};
