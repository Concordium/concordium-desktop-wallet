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
    maximumSignificantDigits: 10,
    useGrouping: false,
}).format;

const mintRateDescriptionFormat = Intl.NumberFormat(undefined, {
    maximumFractionDigits: 1,
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
    const [annualRate, setAnnualRate] = useState<string | undefined>();
    const [annualFocused, setAnnualFocused] = useState<boolean>(false);

    const calculateAnnualRate = useCallback(
        (m: number) => (1 + Number(m)) ** Number(slotsPerYear) - 1,
        [slotsPerYear]
    );
    const calculateMintPerSlot = useCallback(
        (a: number) => (1 + Number(a)) ** (1 / Number(slotsPerYear)) - 1,
        [slotsPerYear]
    );

    useEffect(() => {
        const calculated = calculateAnnualRate(Number(mintPerSlot));
        setAnnualRate(calculated.toString());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mintPerSlot]);

    useUpdateEffect(() => {
        if (!annualFocused) {
            return;
        }

        const calculated = calculateMintPerSlot(Number(annualRate));
        onChange(mintRateFormat(calculated));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [annualRate]);

    const { mantissa, exponent } = useMemo(
        () => parseMintPerSlot(mintPerSlot) ?? ({} as Partial<MintRate>),
        [mintPerSlot]
    );

    return (
        <span className={clsx(styles.root, className)}>
            <InlineNumber
                className={styles.field}
                title={`Annual mint rate (~${mintRateDescriptionFormat(
                    parseFloat(annualRate ?? '') * 100
                )}% new CCD per year)`}
                allowFractions={6}
                value={annualRate}
                onChange={setAnnualRate}
                onFocus={() => setAnnualFocused(true)}
                onBlur={() => setAnnualFocused(false)}
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
                    Chain value: {mantissa} · 10
                    <span className={styles.exponent}>-{exponent}</span>
                </div>
            )}
            <ErrorMessage>{error}</ErrorMessage>
        </span>
    );
}

export const FormMintRateInput = connectWithFormControlled(MintRateInput);
