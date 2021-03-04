import clsx from 'clsx';
import React, {
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
import { DateParts } from './util';

import styles from './InputTimeStamp.module.scss';

const sanitizeValue = (value?: string): string => (!value ? '' : value);

type InputProps = NotOptional<
    Pick<InputHTMLAttributes<HTMLInputElement>, 'className' | 'placeholder'>
>;

interface TimeStampFieldProps extends InputProps {
    name: keyof DateParts;
    rules?: RegisterOptions;
}

export default function TimeStampField({
    name,
    className,
    placeholder,
    rules,
}: TimeStampFieldProps): JSX.Element {
    const { control, setValue, errors } = useFormContext();
    const {
        field: { value, onChange, onBlur, name: n },
    } = useController({
        name,
        rules: { required: true, min: rules?.min ?? 0, ...rules },
        control,
        defaultValue: '',
    });

    const handleBlur: FocusEventHandler = useCallback(() => {
        onBlur();
        setValue(name, value);
    }, [value, onBlur, setValue, name]);

    return (
        <input
            className={clsx(className, errors[name] && styles.fieldInvalid)}
            name={n}
            type="string"
            placeholder={placeholder}
            value={sanitizeValue(value)}
            onBlur={handleBlur}
            onChange={onChange}
        />
    );
}
