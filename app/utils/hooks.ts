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
