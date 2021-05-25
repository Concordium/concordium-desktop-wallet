import { useEffect, useRef, useState } from 'react';
import { getAccountInfoOfAddress } from './nodeHelpers';
import { getTransactionKindCost } from './transactionCosts';
import { lookupName } from './transactionHelpers';
import { AccountInfo, Fraction, TransactionKindId } from './types';

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

/** Hook for getting the current time, optionally taking a refresh frequency in
 * milliseconds defaulting to 1 second */
export function useCurrentTime(refreshRate = 1000) {
    const [now, setNow] = useState(new Date());
    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), refreshRate);
        return () => clearInterval(interval);
    }, [refreshRate]);
    return now;
}
