import { AccountInfo } from '@concordium/node-sdk';
import { ValidateValues } from '~/components/MultiStepForm';
import { BlockSummary } from '~/node/NodeApiTypes';
import { collapseFraction, multiplyFraction } from '../basicHelpers';
import { toMicroUnits } from '../gtu';
import { BakerKeys } from '../rustInterface';
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
    NotOptional,
    OpenStatus,
    TransactionKindId,
} from '../types';
import { Commissions, MetadataUrl, StakeSettings } from './configureBaker';

export interface AddBakerFlowState {
    stake: StakeSettings;
    openForDelegation: OpenStatus;
    commissions?: Commissions;
    metadataUrl?: MetadataUrl;
    keys: BakerKeys;
}

export type AddBakerPayload = MakeOptional<
    NotOptional<ConfigureBakerPayload>,
    'metadataUrl'
>;

export const title = 'Add baker';

export const toPayload = ({
    keys,
    stake,
    openForDelegation,
    metadataUrl,
    commissions,
}: MakeOptional<
    NotOptional<AddBakerFlowState>,
    'metadataUrl'
>): AddBakerPayload => ({
    electionVerifyKey: [keys.electionPublic, keys.proofElection],
    signatureVerifyKey: [keys.signaturePublic, keys.proofSignature],
    aggregationVerifyKey: [keys.aggregationPublic, keys.proofAggregation],
    stake: toMicroUnits(stake.stake),
    restakeEarnings: stake.restake,
    openForDelegation,
    metadataUrl,
    ...commissions,
});

export function getEstimatedFee(
    values: AddBakerFlowState,
    exchangeRate: Fraction,
    signatureThreshold = 1
) {
    let payloadSize: number | undefined;

    try {
        payloadSize = serializeTransferPayload(
            TransactionKindId.Configure_baker,
            toPayload(values as NotOptional<AddBakerFlowState>)
        ).length;
    } catch {
        payloadSize = undefined;
    }

    return getConfigureBakerFullCost(
        exchangeRate,
        signatureThreshold,
        payloadSize
    );
}

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

    const payload: AddBakerPayload = toPayload(
        withDefaults as NotOptional<AddBakerFlowState>
    );

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
        values,
        exchangeRate,
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
