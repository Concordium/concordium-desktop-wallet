import clsx from 'clsx';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import Form from '~/components/Form';
import { useUpdateEffect } from '~/utils/hooks';
import { ClassName, EqualRecord } from '~/utils/types';

import styles from './MintRateInput.module.scss';

const mintRateFormat = Intl.NumberFormat(undefined, {
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
    const [anualFocused, setAnualFocused] = useState<boolean>(false);

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
            [innerFieldNames.mintPerSlot]: mintRateFormat(mintPerSlot),
            [innerFieldNames.anualRate]: initialAnualRate,
        }
    );

    useEffect(() => {
        const calculated = calculateAnualRate(Number(fields.mintPerSlot));
        setValue(innerFieldNames.anualRate, calculated.toString());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fields.mintPerSlot]);

    useUpdateEffect(() => {
        if (!anualFocused) {
            return;
        }

        const calculated = calculateMintPerSlot(Number(fields.anualRate));
        setValue(innerFieldNames.mintPerSlot, mintRateFormat(calculated));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fields.anualRate]);

    const { mantissa, exponent } = useMemo(() => {
        const [m, e = '0'] = fields.mintPerSlot.toLowerCase().split('e-');
        const [, fractions = ''] = m.split('.');

        if (!fractions) {
            return {
                mantissa: '',
                exponent: '',
            };
        }

        return {
            mantissa: BigInt(m.replace('.', '')).toString(),
            exponent: parseInt(e, 10) + fractions.length,
        };
    }, [fields.mintPerSlot]);

    return (
        <span className={clsx(styles.root, className)}>
            <div>
                <FormProvider {...innerForm}>
                    <span>
                        <Form.InlineNumber
                            className={styles.field}
                            name={innerFieldNames.anualRate}
                            title="Anual mint rate"
                            allowFractions={6}
                            defaultValue={initialAnualRate}
                            onFocus={() => setAnualFocused(true)}
                            onBlur={() => setAnualFocused(false)}
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
                            defaultValue={mintRateFormat(mintPerSlot)}
                            title="Mint per slot (product of chain value)"
                            rules={{
                                required: 'Field is required',
                                min: {
                                    value: 0,
                                    message: "Value can't be negative",
                                },
                            }}
                            disabled={disabled}
                            customFormatter={(v = '') => {
                                if (v === '') {
                                    return v;
                                }

                                return mintRateFormat(Number(v));
                            }}
                            allowFractions
                        />
                        )
                        <span
                            className={styles.exponent}
                            title="Slots per year"
                        >
                            {BigInt(slotsPerYear).toLocaleString()}
                        </span>{' '}
                        - 1
                    </span>
                </FormProvider>
                <div className={styles.description}>
                    Chain value: {mantissa}E-{exponent} (Mantissa: {mantissa},
                    Exponent: {exponent})
                </div>
            </div>
            {!disabled && (
                <>
                    <Form.Input
                        name={fieldNames.mantissa}
                        type="hidden"
                        value={mantissa}
                        readOnly
                    />
                    <Form.Input
                        name={fieldNames.exponent}
                        type="hidden"
                        value={exponent}
                        readOnly
                    />
                </>
            )}
        </span>
    );
}
