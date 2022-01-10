import clsx from 'clsx';
import React, {
    ChangeEventHandler,
    forwardRef,
    TextareaHTMLAttributes,
    useCallback,
    useMemo,
} from 'react';
import Label from '~/components/Label';
import { scaleFieldHeight } from '~/utils/htmlHelpers';

import { CommonInputProps } from '../common';
import ErrorMessage from '../ErrorMessage';

import styles from './TextArea.module.scss';

export interface TextAreaProps
    extends TextareaHTMLAttributes<HTMLTextAreaElement>,
        CommonInputProps {
    /**
     * @description
     * Disables automatically scaling the textarea to the size needed to display the content. Defaults to false.
     * This enables resizing and setting the height of the element manually either by height or rows prop, which is otherwise disabled.
     */
    noAutoScale?: boolean;
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
            isInvalid = false,
            className,
            noAutoScale = false,
            onChange,
            rows = 2,
            label,
            ...props
        },
        ref
    ) => {
        const autoScale = !noAutoScale;
        const interceptedRows = useMemo(() => (autoScale ? 1 : rows), [
            autoScale,
            rows,
        ]);

        const handleChange: ChangeEventHandler<HTMLTextAreaElement> = useCallback(
            (e) => {
                if (onChange) {
                    onChange(e);
                }
                if (autoScale) {
                    scaleFieldHeight(e.target);
                }
            },
            [onChange, autoScale]
        );

        const setRef = useCallback(
            (instance: HTMLTextAreaElement) => {
                if (!instance || !ref) {
                    return;
                }

                if (autoScale) {
                    scaleFieldHeight(instance);
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
                <Label className="mB5">{label}</Label>
                <textarea
                    className={clsx(
                        styles.field,
                        autoScale && styles.autoScale,
                        isInvalid && styles.fieldInvalid
                    )}
                    ref={setRef}
                    onChange={handleChange}
                    onLoad={(e) =>
                        scaleFieldHeight(e.target as HTMLTextAreaElement)
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
