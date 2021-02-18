import clsx from 'clsx';
import React, {
    ChangeEventHandler,
    forwardRef,
    TextareaHTMLAttributes,
    useCallback,
    useMemo,
} from 'react';

import { FieldCommonProps } from '../common';

import styles from './TextArea.module.scss';

function scaleTextArea(el: HTMLTextAreaElement) {
    el.style.height = '5px';
    el.style.height = `${el.scrollHeight}px`;
}

export interface TextAreaProps
    extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'name'>,
        FieldCommonProps {
    autoScale?: boolean;
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
    (
        { error, className, autoScale = false, onChange, rows, ...props },
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

                scaleTextArea(instance);

                if (typeof ref === 'function') {
                    ref(instance);
                } else {
                    // eslint-disable-next-line no-param-reassign, react-hooks/exhaustive-deps
                    ref = {
                        current: instance,
                    };
                }
            },
            [ref]
        );

        return (
            <textarea
                className={clsx(
                    styles.field,
                    className,
                    autoScale && styles.autoScale,
                    error && styles.fieldInvalid
                )}
                ref={setRef}
                onChange={handleChange}
                onLoad={(e) => scaleTextArea(e.target as HTMLTextAreaElement)}
                rows={interceptedRows}
                {...props}
            />
        );
    }
);

TextArea.displayName = 'TextArea';

export default TextArea;
