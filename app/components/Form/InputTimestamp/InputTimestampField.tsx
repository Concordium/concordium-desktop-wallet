import clsx from 'clsx';
import React, {
    ChangeEventHandler,
    FocusEventHandler,
    forwardRef,
    InputHTMLAttributes,
    useCallback,
    useContext,
} from 'react';
import { RegisterOptions, useController } from 'react-hook-form';
import { DateParts } from '~/utils/timeHelpers';

import styles from './InputTimestamp.module.scss';
import InputTimeStampContext from './InputTimestampContext';

type InputProps = Pick<
    InputHTMLAttributes<HTMLInputElement>,
    'className' | 'placeholder' | 'onChange'
>;

interface InputTimestampFieldProps extends InputProps {
    /**
     * Name must be part of the "DateParts" interface
     */
    name: keyof DateParts;
    /**
     * Validation rules of field.
     */
    rules?: RegisterOptions;
}

/**
 * @description
 * Used in \<InputTimeStamp /\> as part of what makes up the entire Input.
 *
 * @example
 * <TimeStampField className={styles.field} name={fieldNames.hours} placeholder="HH" rules={{ max: 23 }} onFieldFormatted={fireOnChange} />
 */
const InputTimestampField = forwardRef<
    HTMLInputElement,
    InputTimestampFieldProps
>(({ name, className, placeholder, onChange, rules }, ref) => {
    const {
        control,
        setValue,
        errors,
        setIsFocused,
        fireOnChange,
    } = useContext(InputTimeStampContext);
    const {
        field: { value, onChange: formOnChange, onBlur, name: n },
    } = useController({
        name,
        rules: { required: true, min: rules?.min ?? 0, ...rules },
        control,
        defaultValue: '',
    });

    const handleBlur: FocusEventHandler = useCallback(() => {
        setIsFocused(false);
        onBlur();
        setValue(name, value);
        setTimeout(() => fireOnChange(), 0);
    }, [value, onBlur, setValue, name, fireOnChange, setIsFocused]);

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
            ref={ref}
            type="string"
            placeholder={placeholder}
            value={value}
            onBlur={handleBlur}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
        />
    );
});

export default InputTimestampField;
