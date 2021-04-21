import clsx from 'clsx';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CommonFieldProps } from '~/components/Form/common';
import { connectWithFormControlled } from '~/components/Form/common/connectWithForm';
import ErrorMessage from '~/components/Form/ErrorMessage';
import InlineNumber from '~/components/Form/InlineNumber';
import { noOp } from '~/utils/basicHelpers';
import { useUpdateEffect } from '~/utils/hooks';
import { parseMintPerSlot } from '~/utils/mintDistributionHelpers';
import { ClassName, MintRate } from '~/utils/types';

import styles from './MintRateInput.module.scss';

const mintRateFormat = Intl.NumberFormat(undefined, {
    maximumSignificantDigits: 9,
}).format;

export interface MintRateInputProps extends ClassName, CommonFieldProps {
    value: string;
    onChange?(v: string): void;
    onBlur?(): void;
    slotsPerYear: number;
    disabled?: boolean;
}

export default function MintRateInput({
    value: mintPerSlot,
    slotsPerYear,
    disabled = false,
    className,
    error,
    onChange = noOp,
    onBlur = noOp,
}: MintRateInputProps): JSX.Element {
    const [anualRate, setAnualRate] = useState<string | undefined>();
    const [anualFocused, setAnualFocused] = useState<boolean>(false);

    const calculateAnualRate = useCallback(
        (m: number) => (1 + Number(m)) ** Number(slotsPerYear) - 1,
        [slotsPerYear]
    );
    const calculateMintPerSlot = useCallback(
        (a: number) => (1 + Number(a)) ** (1 / Number(slotsPerYear)) - 1,
        [slotsPerYear]
    );

    useEffect(() => {
        const calculated = calculateAnualRate(Number(mintPerSlot));
        setAnualRate(calculated.toString());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mintPerSlot]);

    useUpdateEffect(() => {
        if (!anualFocused) {
            return;
        }

        const calculated = calculateMintPerSlot(Number(anualRate));
        onChange(mintRateFormat(calculated));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [anualRate]);

    const { mantissa, exponent } = useMemo(
        () => parseMintPerSlot(mintPerSlot) ?? ({} as Partial<MintRate>),
        [mintPerSlot]
    );

    return (
        <span className={clsx(styles.root, className)}>
            <InlineNumber
                className={styles.field}
                title="Anual mint rate"
                allowFractions={6}
                value={anualRate}
                onChange={setAnualRate}
                onFocus={() => setAnualFocused(true)}
                onBlur={() => setAnualFocused(false)}
                disabled={disabled}
            />{' '}
            ≈ (1 +{' '}
            <InlineNumber
                className={styles.field}
                value={mintRateFormat(Number(mintPerSlot))}
                title="Mint per slot (product of chain value)"
                disabled={disabled}
                onChange={onChange}
                onBlur={onBlur}
                customFormatter={(v = '') => {
                    if (v === '') {
                        return v;
                    }

                    return mintRateFormat(Number(v));
                }}
                allowFractions
            />
            )
            <span className={styles.exponent} title="Slots per year">
                {BigInt(slotsPerYear).toLocaleString()}
            </span>{' '}
            - 1
            {mantissa && exponent && (
                <div className={styles.description}>
                    Chain value: {mantissa}e-{exponent} (Mantissa: {mantissa},
                    Exponent: {exponent})
                </div>
            )}
            <ErrorMessage>{error}</ErrorMessage>
        </span>
    );
}

export const FormMintRateInput = connectWithFormControlled(MintRateInput);
