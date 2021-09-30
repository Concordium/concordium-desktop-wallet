import { useEffect, useMemo, useState } from 'react';
import { getAccount } from '~/database/AccountDao';
import { BlockSummary, ConsensusStatus } from '~/node/NodeApiTypes';
import { getConsensusStatus } from '~/node/nodeRequests';
import {
    fetchLastFinalizedIdentityProviders,
    fetchLastFinalizedBlockSummary,
    getAccountInfoOfAddress,
    fetchLastFinalizedAnonymityRevokers,
} from '../node/nodeHelpers';
import { useCurrentTime, useAsyncMemo } from './hooks';
import {
    epochDate,
    getDefaultExpiry,
    getEpochIndexAt,
    isFutureDate,
} from './timeHelpers';
import { getTransactionKindCost } from './transactionCosts';
import { lookupName } from './transactionHelpers';
import {
    AccountInfo,
    Amount,
    Fraction,
    TransactionKindId,
    Account,
    IpInfo,
    ArInfo,
} from './types';

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

/** Hook for looking up an account, is undefined while loading and null if account is not found */
export function useAccount(address: string) {
    const [account, setAccount] = useState<Account | undefined | null>();
    useEffect(() => {
        getAccount(address)
            .then((a) => setAccount(a ?? null))
            .catch(() => {});
    }, [address]);
    return account;
}

/** Hook for fetching account info given an account address */
export function useAccountInfo(address?: string) {
    const [accountInfo, setAccountInfo] = useState<AccountInfo>();
    useEffect(() => {
        if (address) {
            getAccountInfoOfAddress(address)
                .then(setAccountInfo)
                .catch(() => {});
        } else {
            setAccountInfo(undefined);
        }
    }, [address]);
    return accountInfo;
}

/** Hook for estimating transaction cost */
export function useTransactionCostEstimate(
    kind: TransactionKindId,
    exchangeRate: Fraction,
    signatureAmount?: number,
    memo?: string,
    payloadSize?: number
) {
    return useMemo(
        () =>
            getTransactionKindCost(
                kind,
                exchangeRate,
                signatureAmount,
                memo,
                payloadSize
            ),
        [kind, exchangeRate, payloadSize, signatureAmount, memo]
    );
}

/** Hook for fetching last finalized block summary */
export function useLastFinalizedBlockSummary() {
    return useAsyncMemo<{
        lastFinalizedBlockSummary: BlockSummary;
        consensusStatus: ConsensusStatus;
    }>(fetchLastFinalizedBlockSummary);
}

/** Hook for fetching consensus status */
export function useConsensusStatus() {
    return useAsyncMemo<ConsensusStatus>(getConsensusStatus);
}

/** Hook for fetching identity providers */
export function useIdentityProviders() {
    const [providers, setProviders] = useState<IpInfo[]>([]);
    useEffect(() => {
        fetchLastFinalizedIdentityProviders()
            .then(setProviders)
            .catch(() => {});
    }, []);
    return providers;
}

/** Hook for fetching anonymity revokers */
export function useAnonymityRevokers() {
    const [revokers, setRevokers] = useState<ArInfo[]>([]);
    useEffect(() => {
        fetchLastFinalizedAnonymityRevokers()
            .then(setRevokers)
            .catch(() => {});
    }, []);
    return revokers;
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
    const genesisTime = new Date(consensusStatus.currentEraGenesisTime);
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
