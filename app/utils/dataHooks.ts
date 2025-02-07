import { useEffect, useMemo, useState } from 'react';
import {
    AccountInfoType,
    ChainParameters,
    ChainParametersV0,
} from '@concordium/web-sdk';

import { useDispatch, useSelector } from 'react-redux';
import { getAccount } from '~/database/AccountDao';
import { ConsensusStatus } from '~/node/NodeApiTypes';
import {
    getBlockChainParameters,
    getConsensusStatus,
    getRewardStatus,
} from '~/node/nodeRequests';
import {
    fetchLastFinalizedIdentityProviders,
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
import { noOp, throwLoggedError } from './basicHelpers';
import {
    consensusStatusSelector,
    setConsensusStatus,
} from '~/features/ChainDataSlice';

/** Hook for looking up an account name from an address */
export function useAccountName(address: string) {
    const [name, setName] = useState<string | undefined>();
    useEffect(() => {
        lookupName(address).then(setName).catch(window.log.error); // lookupName will only reject if there is a problem with the database. In that case we ignore the error and just display the address only.
    }, [address]);
    return name;
}

/** Hook for looking up an account, is undefined while loading and null if account is not found */
export function useAccount(address: string) {
    const [account, setAccount] = useState<Account | undefined | null>();
    useEffect(() => {
        getAccount(address)
            .then((a) => setAccount(a ?? null))
            .catch(window.log.error);
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
                .catch(window.log.error);
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

/**
 * Hook for fetching block chain parameters
 */
export function useBlockChainParameters() {
    return useAsyncMemo(getBlockChainParameters, noOp, []);
}

/**
 * Hook for fetching consensus status
 *
 * @param staleWhileRevalidate If true, returns stale response from store while fetching update.
 */
export function useConsensusStatus(staleWhileRevalidate = false) {
    const cs = useAsyncMemo<ConsensusStatus>(
        getConsensusStatus,
        window.log.error,
        []
    );
    const stale = useSelector(consensusStatusSelector);
    const dispatch = useDispatch();

    useEffect(() => {
        if (cs !== undefined) {
            dispatch(setConsensusStatus(cs));
        }
    }, [cs, dispatch]);

    return staleWhileRevalidate ? stale ?? cs : cs;
}

/** Hook for fetching identity providers */
export function useIdentityProviders() {
    return useAsyncMemo<IpInfo[]>(
        fetchLastFinalizedIdentityProviders,
        window.log.error
    );
}

/** Hook for fetching identity disclosure authorities */
export function useAnonymityRevokers() {
    return useAsyncMemo<ArInfo[]>(
        fetchLastFinalizedAnonymityRevokers,
        window.log.error
    );
}

/** Hook for fetching staked amount for a given account address, Returns undefined while loading and 0 if account is not a baker */
export function useStakedAmount(accountAddress: string): Amount | undefined {
    const accountInfo = useAccountInfo(accountAddress);
    if (
        accountInfo === undefined ||
        accountInfo.type !== AccountInfoType.Baker
    ) {
        return undefined;
    }
    return BigInt(accountInfo.accountBaker.stakedAmount.microCcdAmount);
}

/**
 * Hook for fetching the current capital bound.
 * @returns undefined while loading, or if the node is running a protocol version prior to the introduction of the capital bound
 */
export function useCapitalBound() {
    const chainParameters = useBlockChainParameters();
    if (!chainParameters || chainParameters.version === 0) {
        return undefined;
    }
    return chainParameters.capitalBound;
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

function getV0Cooldown(
    cooldownEpochs: number,
    cs: ConsensusStatus,
    now: Date
): Date {
    const genesisTime = new Date(cs.currentEraGenesisTime);
    const currentEpochIndex = getEpochIndexAt(
        now,
        cs.epochDuration.value,
        genesisTime
    );
    const nextEpochIndex = currentEpochIndex + 1;

    return epochDate(
        nextEpochIndex + cooldownEpochs,
        cs.epochDuration.value,
        genesisTime
    );
}

function getV1Cooldown(
    cooldownSeconds: number,
    chainParameters: Exclude<ChainParameters, ChainParametersV0>,
    cs: ConsensusStatus,
    nextPaydayTime: Date,
    now: Date
): Date {
    const genesisTime = new Date(cs.currentEraGenesisTime);
    const ei = (t: Date) =>
        getEpochIndexAt(t, cs.epochDuration.value, genesisTime);

    const { rewardPeriodLength } = chainParameters;
    const nRewardPeriodLength = Number(rewardPeriodLength);

    const nextRewardPeriodStartIndex = ei(nextPaydayTime);
    const cooldownEpochIndex = ei(
        new Date(now.getTime() + cooldownSeconds * 1000)
    );
    const remainingAtNext = cooldownEpochIndex - nextRewardPeriodStartIndex;

    let cooldownEnd: number;
    if (remainingAtNext < 1) {
        cooldownEnd = nextRewardPeriodStartIndex;
    } else {
        const remainingRewardPeriods = Math.ceil(
            remainingAtNext / nRewardPeriodLength
        );
        cooldownEnd =
            nextRewardPeriodStartIndex +
            remainingRewardPeriods * nRewardPeriodLength;
    }

    return epochDate(cooldownEnd, cs.epochDuration.value, genesisTime);
}

/** Helper to get reward status, block summary and consensus status */
function useRewardBlockAndConsensusStatus() {
    const cs = useConsensusStatus();
    const parameters = useBlockChainParameters();
    const rs = useAsyncMemo(getRewardStatus, noOp, []);

    if (parameters === undefined || rs === undefined || cs === undefined) {
        return undefined;
    }

    return { rs, parameters, cs };
}

/** Hook for calculating the date of the delegation cooldown ending, will result in undefined while loading */
export function useCalcDelegatorCooldownUntil() {
    const status = useRewardBlockAndConsensusStatus();
    const now = useCurrentTime(60000);

    if (!status) {
        return undefined;
    }

    const { parameters, cs, rs } = status;

    if (parameters.version === 0) {
        throwLoggedError(
            'Delegation cooldown not available for current protocol version.'
        );
    }

    if (rs.version !== 1) {
        // Should not happen, as this indicates rs and bs were queried for with different blocks.
        throwLoggedError('Block summary and reward status do not match.');
    }

    return getV1Cooldown(
        Number(parameters.delegatorCooldown),
        parameters,
        cs,
        rs.nextPaydayTime,
        now
    );
}

/** Hook for calculating the date of the baking stake cooldown ending, will result in undefined while loading */
export function useCalcBakerStakeCooldownUntil() {
    const status = useRewardBlockAndConsensusStatus();
    const now = useCurrentTime(60000);

    if (!status) {
        return undefined;
    }

    const { parameters, cs, rs } = status;

    if (parameters.version === 0) {
        return getV0Cooldown(Number(parameters.bakerCooldownEpochs), cs, now);
    }

    if (rs.version !== 1) {
        // Should not happen, as this indicates rs and bs were queried for with different blocks.
        throwLoggedError('Block summary and reward status do not match.');
    }

    return getV1Cooldown(
        Number(parameters.poolOwnerCooldown),
        parameters,
        cs,
        rs.nextPaydayTime,
        now
    );
}

/**
 * Hook for calculating when a stake increase will take effect, will result in undefined while loading
 * Note that this hook will throw an error if used with a node running protocol version lower than 4.
 */
export function useStakeIncreaseUntil() {
    const status = useRewardBlockAndConsensusStatus();
    const now = useCurrentTime(60000);

    if (!status) {
        return undefined;
    }

    const { parameters, cs, rs } = status;

    if (parameters.version === 0) {
        // In V0, stake increase takes effect after 2 epochs
        return getV0Cooldown(2, cs, now);
    }

    if (rs.version !== 1) {
        // Should not happen, as this indicates rs and bs were queried for with different blocks.
        throwLoggedError('Block summary and reward status do not match.');
    }

    return getV1Cooldown(0, parameters, cs, rs.nextPaydayTime, now);
}

/**
 * Hook for getting chain protocol version
 *
 * @param staleWhileRevalidate If true, returns stale response from store while fetching update.
 */
export function useProtocolVersion(
    staleWhileRevalidate = false
): bigint | undefined {
    return useConsensusStatus(staleWhileRevalidate)?.protocolVersion;
}
