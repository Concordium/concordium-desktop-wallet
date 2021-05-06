import React, { useState } from 'react';
import clsx from 'clsx';
import { connectWithFormControlled } from '~/components/Form/common/connectWithForm';
import { ClassName, RewardFraction } from '~/utils/types';
import {
    fractionResolutionToPercentage,
    percentageModifier,
    percentageToFractionResolution,
} from '~/utils/rewardFractionHelpers';
import { useUpdateEffect } from '~/utils/hooks';
import { noOp } from '~/utils/basicHelpers';
import InlineNumber from '~/components/Form/InlineNumber';
import { getPowerOf10 } from '~/utils/numberStringHelpers';

import styles from './GasRewardFractionField.module.scss';
import { InlineNumberProps } from '~/components/Form/InlineNumber/InlineNumber';

export interface GasRewardFractionFieldProps
    extends Pick<InlineNumberProps, 'disabled' | 'readOnly' | 'isInvalid'>,
        ClassName {
    label: string;
    value: RewardFraction | undefined;
    onChange?(v: RewardFraction | undefined): void;
    onBlur?(): void;
}

function formatValue(v?: number): string {
    if (v === undefined || Number.isNaN(v)) {
        return '';
    }

    return fractionResolutionToPercentage(v).toString();
}

function parseValue(v = ''): number {
    const parsed = parseFloat(v);

    return percentageToFractionResolution(parsed);
}

export const gasRewardFractionFieldResolution = percentageModifier;

export function GasRewardFractionField({
    label,
    onChange = noOp,
    value,
    className,
    ...props
}: GasRewardFractionFieldProps): JSX.Element {
    const { disabled, isInvalid, readOnly } = props;
    const [innerValue, setInnerValue] = useState<string | undefined>(
        formatValue(value)
    );

    useUpdateEffect(() => {
        onChange(parseValue(innerValue));
    }, [innerValue]);
    useUpdateEffect(() => {
        setInnerValue(formatValue(value));
    }, [value]);

    return (
        <label
            className={clsx(
                styles.root,
                disabled && styles.disabled,
                readOnly && styles.readOnly,
                isInvalid && styles.invalid,
                className
            )}
        >
            <span>{label}</span>
            <span className={styles.value}>
                <InlineNumber
                    allowFractions={getPowerOf10(
                        gasRewardFractionFieldResolution
                    )}
                    value={innerValue}
                    onChange={setInnerValue}
                    {...props}
                />
                %
            </span>
        </label>
    );
}

export const FormGasRewardFractionField = connectWithFormControlled<
    RewardFraction,
    GasRewardFractionFieldProps
>(GasRewardFractionField);
