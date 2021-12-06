import { useCallback, useState } from 'react';
import { debounce } from 'lodash';

import { useUpdateEffect } from '~/utils/hooks';

export default function useMultiFieldFocus(onBlur?: () => void) {
    const [isFocused, setIsFocused] = useState(false);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedSetIsFocused = useCallback(debounce(setIsFocused, 50), [
        setIsFocused,
    ]);

    useUpdateEffect(() => {
        if (onBlur && !isFocused) {
            onBlur();
        }
    }, [isFocused]);

    return { isFocused, setIsFocused: debouncedSetIsFocused };
}
