import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';

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

/**
 * Like a regular useState hook, but resets to initial value after given timeout (in MS).
 */
export const useTimeoutState = <TValue>(
    initial: TValue,
    timeoutMS?: number
): [TValue, Dispatch<SetStateAction<TValue>>] => {
    const [value, setValue] = useState<TValue>(initial);

    const set: typeof setValue = (v) => {
        setValue(v);

        if (v !== initial) {
            setTimeout(() => setValue(initial), timeoutMS);
        }
    };

    return [value, set];
};
