import React, { InputHTMLAttributes, useState } from 'react';
import { connectWithFormControlled } from '~/components/Form/common/connectWithForm';
import { RewardFraction } from '~/utils/types';
import {
    fractionResolutionToPercentage,
    percentageToFractionResolution,
} from '~/utils/rewardFractionHelpers';
import { useUpdateEffect } from '~/utils/hooks';
import { noOp } from '~/utils/basicHelpers';

export interface GasRewardFractionFieldProps
    extends Pick<
        InputHTMLAttributes<HTMLInputElement>,
        'disabled' | 'readOnly'
    > {
    label: string;
    defaultValue?: RewardFraction;
    value: RewardFraction | undefined;
    isInvalid?: boolean;
    onChange?(v: RewardFraction | undefined): void;
    onBlur?(): void;
}

function formatValue(v?: number): string {
    if (v === undefined || Number.isNaN(v)) {
        return '';
    }

    return fractionResolutionToPercentage(v).toString();
}

function parseValue(v: string): number {
    const parsed = parseFloat(v);

    return percentageToFractionResolution(parsed);
}

// TODO Implementation missing.
export function GasRewardFractionField({
    label,
    onChange = noOp,
    value,
    defaultValue,
    readOnly,
    disabled,
    // isInvalid = false,
    ...props
}: GasRewardFractionFieldProps): JSX.Element {
    const [innerValue, setInnerValue] = useState<string>(formatValue(value));

    useUpdateEffect(() => {
        onChange(parseValue(innerValue));
    }, [innerValue]);
    useUpdateEffect(() => {
        setInnerValue(formatValue(value));
    }, [value]);

    return (
        <label>
            <span>{label}</span>
            <span>
                <input
                    type="number"
                    {...props}
                    disabled={disabled}
                    readOnly={readOnly}
                    value={innerValue}
                    onChange={(e) => setInnerValue(e.target.value)}
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
