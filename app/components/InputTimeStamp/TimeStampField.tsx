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
import { NotOptional } from '../../utils/types';
import { DateParts, fieldNames } from './util';

import styles from './InputTimeStamp.module.scss';

type InputProps = NotOptional<
    Pick<InputHTMLAttributes<HTMLInputElement>, 'className' | 'placeholder'>
>;

interface TimeStampFieldProps extends InputProps {
    name: keyof DateParts;
    rules?: RegisterOptions;
    triggerDateRevalidation?: boolean;
    onFieldFormatted(): void;
}

export default function TimeStampField({
    name,
    className,
    placeholder,
    rules,
    triggerDateRevalidation = false,
    onFieldFormatted,
}: TimeStampFieldProps): JSX.Element {
    const { control, setValue, errors, formState, trigger } = useFormContext();
    const {
        field: { value, onChange, onBlur, name: n },
    } = useController({
        name,
        rules: { required: true, min: rules?.min ?? 0, ...rules },
        control,
        defaultValue: '',
    });

    const triggerDateValidation = useCallback(() => {
        if (triggerDateRevalidation && formState.touched[fieldNames.date]) {
            setTimeout(() => trigger(fieldNames.date), 0);
        }
    }, [formState, trigger, triggerDateRevalidation]);

    const handleBlur: FocusEventHandler = useCallback(() => {
        onBlur();
        setValue(name, value);
        triggerDateValidation();
        setTimeout(() => onFieldFormatted(), 0);
    }, [
        value,
        onBlur,
        setValue,
        name,
        onFieldFormatted,
        triggerDateValidation,
    ]);

    const handleChange: ChangeEventHandler = useCallback(
        (e) => {
            onChange(e);
            triggerDateValidation();
        },
        [onChange, triggerDateValidation]
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
