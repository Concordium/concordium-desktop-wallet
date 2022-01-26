import { AccountInfo } from '@concordium/node-sdk';
import { ValidateValues } from '~/components/MultiStepForm';
import { BlockSummary } from '~/node/NodeApiTypes';
import { collapseFraction, multiplyFraction } from '../basicHelpers';
import { getConfigureBakerFullCost } from '../transactionCosts';
import {
    createConfigureBakerTransaction,
    validateBakerStake,
} from '../transactionHelpers';
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
    toPayload,
} from './configureBaker';

export type AddBakerFlowState = MakeRequired<
    ConfigureBakerFlowState,
    'stake' | 'openForDelegation' | 'keys'
>;

export type AddBakerPayload = MakeOptional<
    NotOptional<ConfigureBakerPayload>,
    'metadataUrl'
>;

export const title = 'Add baker';

export const convertToTransaction = (
    defaultCommissions: Commissions,
    account: Account,
    nonce: bigint,
    exchangeRate: Fraction
) => (values: AddBakerFlowState): ConfigureBaker => {
    const withDefaults = {
        ...values,
    };

    // Ensure defaulf pool settings are used when opting for closed pool.
    if (values.openForDelegation !== OpenStatus.OpenForAll) {
        delete withDefaults.metadataUrl;
        withDefaults.commissions = defaultCommissions;
    }

    const payload = toPayload(withDefaults);

    const transaction = createConfigureBakerTransaction(
        account.address,
        payload,
        nonce
    );
    transaction.estimatedFee = multiplyFraction(
        exchangeRate,
        transaction.energyAmount
    );

    return transaction;
};

export function getEstimatedFee(
    exchangeRate: Fraction,
    values?: ConfigureBakerFlowState,
    signatureThreshold = 1
) {
    const payloadSize =
        values === undefined
            ? undefined
            : serializeTransferPayload(
                  TransactionKindId.Configure_baker,
                  toPayload(values)
              ).length;

    return getConfigureBakerFullCost(
        exchangeRate,
        signatureThreshold,
        payloadSize
    );
}

// As the payload of the transaction can vary a lot in size, we need to revalidate with all values, to check if account still has enough funds for the transaction.
export const validateValues = (
    blockSummary: BlockSummary,
    account: Account,
    accountInfo: AccountInfo,
    exchangeRate: Fraction
): ValidateValues<AddBakerFlowState> => (values) => {
    const minimumStake = BigInt(
        blockSummary.updates.chainParameters.minimumThresholdForBaking
    );
    const estimatedFee = getEstimatedFee(
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
