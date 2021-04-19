import React, { useCallback, useMemo } from 'react';
import {
    FormProvider,
    FormProviderProps,
    useForm,
    useFormContext,
} from 'react-hook-form';
import Form from '~/components/Form';
import { toFraction, toResolution } from '~/utils/numberStringHelpers';
import { EqualRecord } from '~/utils/types';

import styles from './MintRateInput.module.scss';

interface MintRateInputFields {
    mantissa: string;
    exponent: string;
}

interface DynamicFormProviderProps
    extends FormProviderProps<MintRateInputFields> {
    disabled: boolean;
}

function DynamicFormProvider({
    disabled,
    children,
    ...props
}: DynamicFormProviderProps): JSX.Element {
    if (!disabled) {
        return <div>{children}</div>;
    }

    return <FormProvider {...props}>{children}</FormProvider>;
}

const fieldNames: EqualRecord<MintRateInputFields> = {
    mantissa: 'mantissa',
    exponent: 'exponent',
};

const formatNumber = new Intl.NumberFormat(undefined, {
    useGrouping: true,
    maximumSignificantDigits: 10,
}).format;

export interface MintRateInputProps {
    mantissa: string;
    exponent: string;
    slotsPerYear: string;
    disabled?: boolean;
}

export default function MintRateInput({
    mantissa,
    exponent,
    slotsPerYear,
    disabled = false,
}: MintRateInputProps): JSX.Element {
    const disabledForm = useForm<MintRateInputFields>();
    const form = useFormContext<MintRateInputFields>();

    const dynamicForm = disabled ? disabledForm : form;
    const { watch } = dynamicForm;
    const fields = watch([fieldNames.mantissa, fieldNames.exponent], {
        [fieldNames.mantissa]: mantissa,
        [fieldNames.exponent]: exponent,
    });

    const calculateFields = useCallback(
        (value: string) => {
            const parsed = Number(fields.exponent);
            const absolute = parsed >= 0 ? parsed : -parsed;
            const resolution = BigInt(`1${'0'.repeat(absolute)}`);

            if (parsed > 0) {
                return toResolution(resolution)(value)?.toString();
            }

            if (parsed < 0) {
                return toFraction(resolution)(value);
            }

            return value;
        },
        [fields.exponent]
    );

    const fieldsValue = useMemo(() => calculateFields(fields.mantissa), [
        calculateFields,
        fields.mantissa,
    ]);

    const approxResult = useMemo(() => {
        return (1 + Number(fieldsValue)) ** Number(slotsPerYear) - 1;
    }, [fieldsValue, slotsPerYear]);

    const renderApproxResult = approxResult !== 0 && approxResult !== Infinity;

    return (
        <DynamicFormProvider disabled={disabled} {...dynamicForm}>
            {renderApproxResult && `${formatNumber(approxResult)} ≈ `}
            (1 +{' '}
            <Form.InlineNumber
                className={styles.field}
                name={fieldNames.mantissa}
                defaultValue={mantissa}
                rules={{
                    required: 'Mantissa value is required',
                    min: { value: 0, message: "Value can't be negative" },
                }}
                disabled={disabled}
            />
            e
            <Form.InlineNumber
                className={styles.field}
                name={fieldNames.exponent}
                defaultValue={exponent}
                rules={{
                    required: 'Exponent value is required',
                }}
                disabled={disabled}
            />
            )
            <span className={styles.exponent}>
                {BigInt(slotsPerYear).toLocaleString()}
            </span>{' '}
            - 1
        </DynamicFormProvider>
    );
}
