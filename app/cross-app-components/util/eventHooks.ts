import { RefCallback, useCallback, useLayoutEffect, useState } from 'react';

export function useDetectClickOutside<TElement extends HTMLElement>(
    onClickOutside: () => void
): RefCallback<TElement | null> {
    const [ref, setRef] = useState<TElement | null>();

    const handleClick = useCallback(
        (e: MouseEvent) => {
            if (ref && !ref?.contains(e.target as Node)) {
                onClickOutside();
            }
        },
        [onClickOutside, ref]
    );

    useLayoutEffect(() => {
        document.addEventListener('mousedown', handleClick);
        return () => {
            document.removeEventListener('mousedown', handleClick);
        };
    }, [handleClick]);

    return (instance) => setRef(instance);
}

export function useKeyPress(handleKeyPress: (e: KeyboardEvent) => void) {
    useLayoutEffect(() => {
        document.addEventListener('keyup', handleKeyPress, true);
        return () => {
            document.removeEventListener('keyup', handleKeyPress);
        };
    }, [handleKeyPress]);
}
