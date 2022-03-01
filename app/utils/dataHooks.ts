import { useEffect, useMemo, useState } from 'react';
import type { ChainParameters } from '@concordium/node-sdk';
import { isChainParametersV1 } from '@concordium/node-sdk/lib/src/blockSummaryHelpers';
import { isBakerAccount } from '@concordium/node-sdk/lib/src/accountHelpers';
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
import { lookupName } from './addressBookHelpers';
import {
    AccountInfo,
    Amount,
    Fraction,
    TransactionKindId,
    Account,
    IpInfo,
    ArInfo,
} from './types';
import { noOp } from './basicHelpers';

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
    }>(fetchLastFinalizedBlockSummary, noOp, []);
}

/** Hook for fetching consensus status */
export function useConsensusStatus() {
    return useAsyncMemo<ConsensusStatus>(getConsensusStatus, noOp, []);
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
    if (accountInfo === undefined || !isBakerAccount(accountInfo)) {
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

function useEpochCooldownUntil(
    findEpochValue: (cp: ChainParameters) => number | undefined
): Date | undefined {
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
    const cooldownValue = findEpochValue(chainParameters);

    if (cooldownValue === undefined) {
        return undefined;
    }

    return epochDate(
        nextEpochIndex + cooldownValue,
        consensusStatus.epochDuration,
        genesisTime
    );
}

function useSecondsCooldownUntil(
    findSecondsValue: (cp: ChainParameters) => number | undefined
): Date | undefined {
    const lastFinalizedBlockSummary = useLastFinalizedBlockSummary();
    const now = useCurrentTime(60000);

    if (lastFinalizedBlockSummary === undefined) {
        return undefined;
    }

    const {
        chainParameters,
    } = lastFinalizedBlockSummary.lastFinalizedBlockSummary.updates;

    const cooldownValue = findSecondsValue(chainParameters);

    if (cooldownValue === undefined) {
        return undefined;
    }

    return new Date(now.getTime() + cooldownValue * 1000); // TODO #delegation maybe this is wrong...?
}

/** Hook for calculating the date of the delegation cooldown ending, will result in undefined while loading */
export function useCalcDelegatorCooldownUntil() {
    return useSecondsCooldownUntil((cp) => {
        if (!isChainParametersV1(cp)) {
            throw new Error(
                'Trying to get chain parameters for delegation on wrong protocol version.'
            );
        }
        return Number(cp.delegatorCooldown);
    });
}

/** Hook for calculating the date of the baking stake cooldown ending, will result in undefined while loading */
export function useCalcBakerStakeCooldownUntil() {
    const v0Cooldown = useEpochCooldownUntil((cp) =>
        isChainParametersV1(cp) ? undefined : Number(cp.bakerCooldownEpochs)
    );
    const v1Cooldown = useSecondsCooldownUntil((cp) =>
        isChainParametersV1(cp) ? Number(cp.poolOwnerCooldown) : undefined
    );

    return v0Cooldown ?? v1Cooldown; // Only one of these will be defined.
}

export function useProtocolVersion(): bigint | undefined {
    return useConsensusStatus()?.protocolVersion;
    // return BigInt(4);
}
