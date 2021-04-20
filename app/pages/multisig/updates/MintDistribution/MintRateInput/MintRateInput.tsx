import clsx from 'clsx';
import React, { useCallback, useEffect, useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import Form from '~/components/Form';
import { ClassName, EqualRecord } from '~/utils/types';

import styles from './MintRateInput.module.scss';

const mintRateFormatter = Intl.NumberFormat(undefined, {
    maximumSignificantDigits: 9,
}).format;

interface MintRateInputFields {
    mantissa: string;
    exponent: string;
}

const fieldNames: EqualRecord<MintRateInputFields> = {
    mantissa: 'mantissa',
    exponent: 'exponent',
};
interface InnerFields {
    anualRate: string;
    mintPerSlot: string;
}
const innerFieldNames: EqualRecord<InnerFields> = {
    anualRate: 'anualRate',
    mintPerSlot: 'mintPerSlot',
};

export interface MintRateInputProps extends ClassName {
    mintPerSlot: number;
    slotsPerYear: number;
    disabled?: boolean;
}

export default function MintRateInput({
    mintPerSlot,
    slotsPerYear,
    disabled = false,
    className,
}: MintRateInputProps): JSX.Element {
    const innerForm = useForm<InnerFields>();

    const { watch, setValue } = innerForm;

    const calculateAnualRate = useCallback(
        (m: number) => (1 + Number(m)) ** Number(slotsPerYear) - 1,
        [slotsPerYear]
    );
    const calculateMintPerSlot = useCallback(
        (a: number) => (1 + Number(a)) ** (1 / Number(slotsPerYear)) - 1,
        [slotsPerYear]
    );

    const initialAnualRate = calculateAnualRate(mintPerSlot).toString();
    const fields = watch(
        [innerFieldNames.mintPerSlot, innerFieldNames.anualRate],
        {
            [innerFieldNames.mintPerSlot]: mintRateFormatter(mintPerSlot),
            [innerFieldNames.anualRate]: initialAnualRate,
        }
    );

    useEffect(() => {
        const calculated = calculateAnualRate(Number(fields.mintPerSlot));
        setValue(innerFieldNames.anualRate, calculated.toString());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fields.mintPerSlot]);

    useEffect(() => {
        const calculated = calculateMintPerSlot(Number(fields.anualRate));
        setValue(innerFieldNames.mintPerSlot, mintRateFormatter(calculated));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fields.anualRate]);

    const { mantissa, exponent } = useMemo(() => {
        const [, fractions] = fields.mintPerSlot.split('.');
        if (!fractions) {
            return {};
        }

        return {
            [fieldNames.mantissa]: BigInt(fractions).toString(),
            [fieldNames.exponent]: fractions.length,
        };
    }, [fields.mintPerSlot]);

    return (
        <span className={clsx(styles.root, className)}>
            <div>
                <FormProvider {...innerForm}>
                    <Form.InlineNumber
                        className={styles.field}
                        name={innerFieldNames.anualRate}
                        allowFractions
                        defaultValue={initialAnualRate}
                        rules={{
                            required: 'Field is required',
                            min: {
                                value: 0,
                                message: "Value can't be negative",
                            },
                        }}
                        disabled={disabled}
                    />{' '}
                    ≈ (1 +{' '}
                    <Form.InlineNumber
                        className={styles.field}
                        name={innerFieldNames.mintPerSlot}
                        defaultValue={mintRateFormatter(mintPerSlot)}
                        rules={{
                            required: 'Field is required',
                            min: {
                                value: 0,
                                message: "Value can't be negative",
                            },
                        }}
                        disabled={disabled}
                        allowFractions
                    />
                    )
                    <span className={styles.exponent} title="Slots per year">
                        {BigInt(slotsPerYear).toLocaleString()}
                    </span>{' '}
                    - 1
                </FormProvider>
                <div className={styles.description}>
                    Chain values - Mantissa: {mantissa}, Exponent: {exponent} (
                    {mantissa}e-{exponent})
                </div>
            </div>
            {!disabled && (
                <>
                    <Form.Input
                        name="mantissa"
                        type="hidden"
                        value={mantissa}
                        readOnly
                    />
                    <Form.Input
                        name="exponent"
                        type="hidden"
                        value={exponent}
                        readOnly
                    />
                </>
            )}
        </span>
    );
}
