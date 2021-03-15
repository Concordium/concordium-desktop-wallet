import { useCallback, useState } from 'react';
import { debounce } from 'lodash';

import { useUpdateEffect } from '../../../utils/hooks';

export default function useMultiFieldFocus(onBlur?: () => void) {
    const [isFocused, setIsFocused] = useState(false);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedBlur = useCallback(
        debounce((focus: boolean) => {
            if (onBlur && !focus) {
                onBlur();
            }
        }, 0),
        [onBlur]
    );

    useUpdateEffect(() => debouncedBlur(isFocused), [isFocused, debouncedBlur]);

    return { isFocused, setIsFocused };
}
