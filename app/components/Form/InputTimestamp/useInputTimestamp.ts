/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useMemo, useEffect } from 'react';
import { useForm, Validate } from 'react-hook-form';
import {
    dateFromDateParts,
    datePartFormatters,
    DateParts,
    datePartsFromDate,
} from '~/utils/timeHelpers';
import {
    fieldNames,
    isValidDate,
    hasAllParts,
    isEqual,
    PartialDateParts,
} from './util';

/**
 * @description
 * Only to be used with \<InputTimestamp /\> component.
 *
 * @param onChange Change event handler
 * @param value date value of controlled input component
 */
export default function useInputTimestamp(
    value: Date | undefined,
    onChange: (v?: Date) => void
) {
    const f = useForm<Partial<DateParts>>({ mode: 'onTouched' });
    const { watch, setValue, trigger, formState } = f;
    const fields = watch();

    const setFormattedValue = useCallback(
        (name: keyof DateParts, v?: string) => {
            setValue(name, datePartFormatters[name](v));
        },
        [setValue]
    );

    // To work around object identity comparison of "value"
    const parts = useMemo(() => datePartsFromDate(value), [
        value?.toISOString(),
    ]);

    useEffect(() => {
        if (!parts) {
            return;
        }

        (Object.keys(parts) as Array<keyof DateParts>).forEach((k) =>
            setFormattedValue(k, parts[k])
        );
        // To work around object identity comparison fo "parts"
    }, [JSON.stringify(parts), setFormattedValue]);

    const fireOnChange = useCallback(() => {
        if (!hasAllParts(fields)) {
            onChange(undefined);
        } else {
            const date = dateFromDateParts(fields);
            const test = datePartsFromDate(date);

            const isValid = test && isEqual(fields, test);

            onChange(isValid ? date : undefined);
        }
        // To work around object identity comparison of "fields"
    }, [JSON.stringify(fields), onChange]);

    const form: typeof f = { ...f, setValue: setFormattedValue };

    const triggerDateValidation = useCallback(() => {
        if (formState.touched[fieldNames.date]) {
            setTimeout(() => trigger(fieldNames.date), 0);
        }
    }, [formState, trigger]);

    const validateDate: Validate = useCallback(
        (date?: string) => {
            const isDateInvalid =
                fields.year &&
                fields.month &&
                date &&
                !isValidDate({
                    year: fields.year,
                    month: fields.month,
                    date,
                } as PartialDateParts);

            if (isDateInvalid) {
                return false;
            }

            return !isDateInvalid;
        },
        [fields.year, fields.month]
    );

    useEffect(() => {
        if (formState.touched[fieldNames.date]) {
            trigger(fieldNames.date);
        }
    }, [validateDate]);

    return {
        form,
        fireOnChange,
        validateDate,
        triggerDateValidation,
    };
}
