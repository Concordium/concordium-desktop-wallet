import clsx from 'clsx';
import React, {
    ChangeEventHandler,
    forwardRef,
    TextareaHTMLAttributes,
    useCallback,
    useMemo,
} from 'react';

import { CommonInputProps } from '../common';
import ErrorMessage from '../ErrorMessage';

import styles from './TextArea.module.scss';

function scaleTextArea(el: HTMLTextAreaElement) {
    el.style.height = '5px';
    el.style.height = `${el.scrollHeight}px`;
}

export interface TextAreaProps
    extends TextareaHTMLAttributes<HTMLTextAreaElement>,
        CommonInputProps {
    /**
     * @description
     * Automatically scales the textarea to the size needed to display the content.
     * This disables resizing and setting the height of the element manually either by height or rows prop.
     */
    autoScale?: boolean;
}

/**
 * @description
 * Use as a normal \<textarea /\>. Add "autoscale" prop to make textarea automatically size (height) itself based on value
 *
 * @example
 * <TextArea autoscale value={value} onChange={(e) => setValue={e.target.value}} />
 */
const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
    (
        {
            error,
            className,
            autoScale = true,
            onChange,
            rows = 2,
            label,
            ...props
        },
        ref
    ) => {
        const interceptedRows = useMemo(() => (autoScale ? undefined : rows), [
            autoScale,
            rows,
        ]);

        const handleChange: ChangeEventHandler<HTMLTextAreaElement> = useCallback(
            (e) => {
                if (onChange) {
                    onChange(e);
                }
                if (autoScale) {
                    scaleTextArea(e.target);
                }
            },
            [onChange, autoScale]
        );

        const setRef = useCallback(
            (instance: HTMLTextAreaElement) => {
                if (!instance) {
                    return;
                }

                if (autoScale) {
                    scaleTextArea(instance);
                }

                if (!ref) {
                    return;
                }

                if (typeof ref === 'function') {
                    ref(instance);
                } else {
                    // eslint-disable-next-line no-param-reassign, react-hooks/exhaustive-deps
                    ref = {
                        current: instance,
                    };
                }
            },
            [ref, autoScale]
        );

        return (
            <label className={clsx(styles.root, className)}>
                {label}
                <textarea
                    className={clsx(
                        styles.field,
                        autoScale && styles.autoScale,
                        error !== undefined && styles.fieldInvalid
                    )}
                    ref={setRef}
                    onChange={handleChange}
                    onLoad={(e) =>
                        scaleTextArea(e.target as HTMLTextAreaElement)
                    }
                    rows={interceptedRows}
                    {...props}
                />
                <ErrorMessage>{error}</ErrorMessage>
            </label>
        );
    }
);

TextArea.displayName = 'TextArea';

export default TextArea;
