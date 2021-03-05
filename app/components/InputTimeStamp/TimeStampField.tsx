import clsx from 'clsx';
import React, {
    ChangeEventHandler,
    FocusEventHandler,
    InputHTMLAttributes,
    useCallback,
} from 'react';
import {
    RegisterOptions,
    useController,
    useFormContext,
} from 'react-hook-form';
import { DateParts } from './util';

import styles from './InputTimeStamp.module.scss';

type InputProps = Pick<
    InputHTMLAttributes<HTMLInputElement>,
    'className' | 'placeholder' | 'onChange'
>;

interface TimeStampFieldProps extends InputProps {
    /**
     * Name must be part of the "DateParts" interface
     */
    name: keyof DateParts;
    /**
     * Validation rules of field.
     */
    rules?: RegisterOptions;
    /**
     * Called when field has been formatted on blur.
     */
    onFieldFormatted(): void;
}

/**
 * @description
 * Used in \<InputTimeStamp /\> as part of what makes up the entire Input.
 *
 * @example
 * <TimeStampField className={styles.field} name={fieldNames.hours} placeholder="HH" rules={{ max: 23 }} onFieldFormatted={fireOnChange} />
 */
export default function TimeStampField({
    name,
    className,
    placeholder,
    onChange,
    rules,
    onFieldFormatted,
}: TimeStampFieldProps): JSX.Element {
    const { control, setValue, errors } = useFormContext();
    const {
        field: { value, onChange: formOnChange, onBlur, name: n },
    } = useController({
        name,
        rules: { required: true, min: rules?.min ?? 0, ...rules },
        control,
        defaultValue: '',
    });

    const handleBlur: FocusEventHandler = useCallback(() => {
        onBlur();
        setValue(name, value);
        setTimeout(() => onFieldFormatted(), 0);
    }, [value, onBlur, setValue, name, onFieldFormatted]);

    const handleChange: ChangeEventHandler<HTMLInputElement> = useCallback(
        (e) => {
            formOnChange(e);
            if (onChange) {
                onChange(e);
            }
        },
        [formOnChange, onChange]
    );

    return (
        <input
            className={clsx(className, errors[name] && styles.fieldInvalid)}
            name={n}
            type="string"
            placeholder={placeholder}
            value={value}
            onBlur={handleBlur}
            onChange={handleChange}
        />
    );
}
