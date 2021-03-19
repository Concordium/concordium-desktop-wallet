import { useCallback, useMemo, useEffect } from 'react';
import { useForm, Validate } from 'react-hook-form';
import {
    DateParts,
    formatters,
    fieldNames,
    isValidDate,
    fromDate,
    fromDateParts,
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
            setValue(name, formatters[name](v));
        },
        [setValue]
    );

    // To work around object identity comparison of "value"
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const parts = useMemo(() => fromDate(value), [value?.toISOString()]);

    useEffect(() => {
        if (!parts) {
            return;
        }

        (Object.keys(parts) as Array<keyof DateParts>).forEach((k) =>
            setFormattedValue(k, parts[k])
        );
        // To work around object identity comparison fo "parts"
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(parts), setFormattedValue]);

    const fireOnChange = useCallback(() => {
        if (!hasAllParts(fields)) {
            onChange(undefined);
        } else {
            const date = fromDateParts(fields);
            const test = fromDate(date);

            const isValid = test && isEqual(fields, test);

            onChange(isValid ? date : undefined);
        }
        // To work around object identity comparison of "fields"
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [validateDate]);

    return {
        form,
        fireOnChange,
        validateDate,
        triggerDateValidation,
    };
}
