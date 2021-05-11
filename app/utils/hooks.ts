import { useEffect, useRef, useState } from 'react';
import { BlockSummary, ConsensusStatus } from './NodeApiTypes';
import {
    fetchLastFinalizedBlockSummary,
    getAccountInfoOfAddress,
} from './nodeHelpers';
import { getTransactionKindCost } from './transactionCosts';
import { lookupName } from './transactionHelpers';
import { AccountInfo, Amount, Fraction, TransactionKindId } from './types';

export const useIsFirstRender = () => {
    const ref = useRef<boolean>(false);

    useEffect(() => {
        ref.current = true;
    }, [ref]);

    return ref.current;
};

export const useUpdateEffect: typeof useEffect = (effect, deps) => {
    const isFirstRender = useIsFirstRender();

    useEffect(() => {
        if (!isFirstRender) {
            return undefined;
        }
        return effect();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);
};

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

/** Calls function at a given rate */
export function useInterval(fn: () => void, rate: number, enable = true) {
    useEffect(() => {
        if (enable) {
            const interval = setInterval(fn, rate);
            return () => clearInterval(interval);
        }
        return () => {};
    }, [enable, fn, rate]);
}

/** Hook for reading the current time, given a refresh rate. */
export function useCurrentTime(refreshRate: number) {
    const [time, setTime] = useState(new Date());
    useInterval(() => setTime(new Date()), refreshRate);
    return time;
}
