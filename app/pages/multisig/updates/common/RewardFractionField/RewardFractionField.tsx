import React, { useState } from 'react';
import clsx from 'clsx';
import { getPowerOf10 } from 'wallet-common-helpers/lib/utils/numberStringHelpers';
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

import styles from './RewardFractionField.module.scss';
import { InlineNumberProps } from '~/components/Form/InlineNumber/InlineNumber';

export interface RewardFractionFieldProps
    extends Pick<InlineNumberProps, 'disabled' | 'readOnly' | 'isInvalid'>,
        ClassName {
    label: string;
    value: RewardFraction | undefined;
    display?: boolean;
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

export const rewardFractionFieldResolution = percentageModifier;

export function RewardFractionField({
    label,
    onChange = noOp,
    value,
    className,
    display = false,
    ...props
}: RewardFractionFieldProps): JSX.Element {
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
                display && styles.display,
                readOnly && styles.readOnly,
                isInvalid && styles.invalid,
                className
            )}
        >
            <span>{label}</span>
            <span className={styles.value}>
                <InlineNumber
                    allowFractions={getPowerOf10(rewardFractionFieldResolution)}
                    value={innerValue}
                    onChange={setInnerValue}
                    {...props}
                />
                %
            </span>
        </label>
    );
}

export const FormRewardFractionField = connectWithFormControlled<
    RewardFraction,
    RewardFractionFieldProps
>(RewardFractionField);
