/* eslint-disable radix */
import clsx from 'clsx';
import React, {
    FocusEventHandler,
    InputHTMLAttributes,
    useCallback,
    useEffect,
    useReducer,
} from 'react';
import {
    FormProvider,
    RegisterOptions,
    useController,
    useForm,
    useFormContext,
    Validate,
} from 'react-hook-form';
import { EqualRecord, NotOptional } from '../../utils/types';

import styles from './InputTimeStamp.module.scss';
import {
    DateParts,
    reducer,
    DatePartsStrings,
    updateDate,
    updateParts,
} from './inputTimeStampReducer';

export interface InputTimeStampProps {
    label?: string | JSX.Element;
    value?: Date;
    onChange(date?: Date): void;
}

const sanitizeValue = (value?: string): string => (!value ? '' : value);

const ensureNumberLength = (length: number) => (value?: string): string => {
    if (!value) {
        return '';
    }

    const valueLength = value.length;

    if (valueLength >= length) {
        return value;
    }

    const missing = length - valueLength;
    const prepend = new Array(missing).fill(`0`).join('');

    return `${prepend}${value}`;
};

type InputProps = NotOptional<
    Pick<InputHTMLAttributes<HTMLInputElement>, 'className' | 'placeholder'>
>;

interface TimeStampFieldProps extends InputProps {
    name: keyof DateParts;
    rules?: RegisterOptions;
}

function TimeStampField({
    name,
    className,
    placeholder,
    rules,
}: TimeStampFieldProps): JSX.Element {
    const { control, setValue, errors } = useFormContext();
    const {
        field: { ref, value, onChange, onBlur, ...inputProps },
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
            type="string"
            placeholder={placeholder}
            value={sanitizeValue(value)}
            onBlur={handleBlur}
            onChange={(e) => onChange(e.target.value)}
            {...inputProps}
        />
    );
}

const fieldNames: EqualRecord<DateParts> = {
    year: 'year',
    month: 'month',
    date: 'date',
    hours: 'hours',
    minutes: 'minutes',
    seconds: 'seconds',
};

type Formatters = { [key in keyof DateParts]: (v?: string) => string };

const formatters: Formatters = {
    year: ensureNumberLength(4),
    month: ensureNumberLength(2),
    date: ensureNumberLength(2),
    hours: ensureNumberLength(2),
    minutes: ensureNumberLength(2),
    seconds: ensureNumberLength(2),
};

type Form = DatePartsStrings;

export default function InputTimeStamp({
    label,
    value,
    onChange,
}: InputTimeStampProps): JSX.Element {
    const [
        { formattedDate, isInvalid, updateForm, ...dateParts },
        dispatch,
    ] = useReducer(reducer, { updateForm: false });

    const form = useForm<Form>({ mode: 'onTouched' });
    const { watch, errors, setValue } = form;
    const fields = watch();

    const setFormattedValue = useCallback(
        (name: keyof DateParts, v?: string) =>
            setValue(name, formatters[name](v)),
        [setValue]
    );

    const validateDate: Validate = useCallback(() => {
        if (Object.keys(errors).length > 0 || !isInvalid) {
            return undefined;
        }

        return 'Date is invalid';
    }, [errors, isInvalid]);

    console.log(fields);

    useEffect(() => {
        dispatch(updateDate(value));
    }, [value]);

    useEffect(() => {
        dispatch(updateParts(fields, errors));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(fields), errors]);

    // // Sync incoming value, parsed through reducer, to form state.
    useEffect(() => {
        if (!updateForm) {
            return;
        }

        (Object.keys(dateParts) as Array<keyof DateParts>).forEach((k) =>
            setFormattedValue(k, `${dateParts[k]}`)
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(dateParts), setFormattedValue, updateForm]);

    useEffect(() => {
        onChange(formattedDate);
    }, [formattedDate, onChange]);

    return (
        <div className={styles.root}>
            {label}
            <br />
            errors: {JSON.stringify(errors)}
            <div
                className={clsx(styles.input, isInvalid && styles.inputInvalid)}
            >
                <FormProvider {...form} setValue={setFormattedValue}>
                    <TimeStampField
                        className={styles.year}
                        name={fieldNames.year}
                        placeholder="YYYY"
                        rules={{ min: 100, max: 9999 }}
                    />
                    -
                    <TimeStampField
                        className={styles.field}
                        name={fieldNames.month}
                        placeholder="MM"
                        rules={{ min: 1, max: 12 }}
                    />
                    -
                    <TimeStampField
                        className={styles.field}
                        name={fieldNames.date}
                        placeholder="DD"
                        rules={{ validate: validateDate }}
                    />
                    <span>at</span>
                    <TimeStampField
                        className={styles.field}
                        name={fieldNames.hours}
                        placeholder="HH"
                        rules={{ max: 23 }}
                    />
                    :
                    <TimeStampField
                        className={styles.field}
                        name={fieldNames.minutes}
                        placeholder="MM"
                        rules={{ max: 59 }}
                    />
                    :
                    <TimeStampField
                        className={styles.field}
                        name={fieldNames.seconds}
                        placeholder="SS"
                        rules={{ max: 59 }}
                    />
                </FormProvider>
            </div>
        </div>
    );
}
