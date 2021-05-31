import { useEffect, useMemo, useState } from 'react';
import { BlockSummary, ConsensusStatus } from '~/node/NodeApiTypes';
import {
    fetchLastFinalizedBlockSummary,
    getAccountInfoOfAddress,
} from '../node/nodeHelpers';
import { useCurrentTime } from './hooks';
import {
    epochDate,
    getDefaultExpiry,
    getEpochIndexAt,
    isFutureDate,
} from './timeHelpers';
import { getTransactionKindCost } from './transactionCosts';
import { lookupName } from './transactionHelpers';
import { AccountInfo, Amount, Fraction, TransactionKindId } from './types';

/** Hook for looking up an account name from an address */
export function useAccountName(address: string) {
    const [name, setName] = useState<string | undefined>();
    useEffect(() => {
        lookupName(address)
            .then(setName)
            .catch(() => {}); // lookupName will only reject if there is a problem with the database. In that case we ignore the error and just display the address only.
    }, [address]);
    return name;
}

/** Hook for fetching account info given an account address */
export function useAccountInfo(address: string) {
    const [accountInfo, setAccountInfo] = useState<AccountInfo>();
    useEffect(() => {
        getAccountInfoOfAddress(address)
            .then(setAccountInfo)
            .catch(() => {});
    }, [address]);
    return accountInfo;
}

/** Hook for estimating transaction cost */
export function useTransactionCostEstimate(
    kind: TransactionKindId,
    signatureAmount?: number,
    payloadSize?: number
) {
    const [fee, setFee] = useState<Fraction>();
    useEffect(() => {
        getTransactionKindCost(kind, signatureAmount, payloadSize)
            .then(setFee)
            .catch(() => {});
    }, [kind, payloadSize, signatureAmount]);
    return fee;
}

/** Hook for fetching last finalized block summary */
export function useLastFinalizedBlockSummary() {
    const [summary, setSummary] = useState<{
        lastFinalizedBlockSummary: BlockSummary;
        consensusStatus: ConsensusStatus;
    }>();
    useEffect(() => {
        fetchLastFinalizedBlockSummary()
            .then(setSummary)
            .catch(() => {});
    }, []);
    return summary;
}

/** Hook for fetching staked amount for a given account address, Returns undefined while loading and 0 if account is not a baker */
export function useStakedAmount(accountAddress: string): Amount | undefined {
    const accountInfo = useAccountInfo(accountAddress);
    if (accountInfo === undefined) {
        return undefined;
    }
    return BigInt(accountInfo.accountBaker?.stakedAmount ?? '0');
}

/** Hook for accessing chain parameters of the last finalized block */
export function useChainParameters() {
    const lastFinalizedBlock = useLastFinalizedBlockSummary();
    return lastFinalizedBlock?.lastFinalizedBlockSummary.updates
        .chainParameters;
}

/** Hook for creating transaction exiry state and error */
export function useTransactionExpiryState(
    validation?: (expiry: Date | undefined) => string | undefined
) {
    const [expiryTime, setExpiryTime] = useState<Date | undefined>(
        getDefaultExpiry()
    );

    const expiryTimeError = useMemo(
        () =>
            expiryTime === undefined || isFutureDate(expiryTime)
                ? validation?.(expiryTime)
                : 'Transaction expiry time must be in the future',
        [expiryTime, validation]
    );
    return [expiryTime, setExpiryTime, expiryTimeError] as const;
}

/** Hook for calculating the date of the baking stake cooldown ending, will result in undefined while loading */
export function useCalcBakerStakeCooldownUntil() {
    const lastFinalizedBlockSummary = useLastFinalizedBlockSummary();
    const now = useCurrentTime(60000);

    if (lastFinalizedBlockSummary === undefined) {
        return undefined;
    }

    const { consensusStatus } = lastFinalizedBlockSummary;
    const {
        chainParameters,
    } = lastFinalizedBlockSummary.lastFinalizedBlockSummary.updates;
    const genesisTime = new Date(consensusStatus.genesisTime);
    const currentEpochIndex = getEpochIndexAt(
        now,
        consensusStatus.epochDuration,
        genesisTime
    );
    const nextEpochIndex = currentEpochIndex + 1;

    const cooldownUntilEpochIndex =
        nextEpochIndex + chainParameters.bakerCooldownEpochs;

    return epochDate(
        cooldownUntilEpochIndex,
        consensusStatus.epochDuration,
        genesisTime
    );
}
