import React, { useEffect, useState } from 'react';
import RcSlider from 'rc-slider';
import { CommonInputProps } from '../common';
import InlineNumber from '../InlineNumber';
import { isDefined, noOp } from '~/utils/basicHelpers';

interface Props extends CommonInputProps {
    min: number;
    max: number;
    step: number;
    unit?: string;
    value: number | undefined;
    onChange?(value: number | undefined): void;
    onBlur?(): void;
}

export default function Slider({
    min,
    max,
    step,
    label,
    unit = '',
    onChange = noOp,
    onBlur = noOp,
    value,
}: Props) {
    const [innerValue, setInnerValue] = useState<number | undefined>(value);

    useEffect(() => {
        onChange(innerValue);
    }, [innerValue, onChange]);

    return (
        <label>
            {label}
            <div>
                <span>
                    Min:
                    <br />
                    {min}
                    {unit}
                </span>
                <RcSlider
                    value={innerValue}
                    onChange={setInnerValue}
                    min={min}
                    max={max}
                    step={step}
                    onAfterChange={onBlur}
                />
                <span>
                    Max:
                    <br />
                    {max}
                    {unit}
                </span>
            </div>
            <div>
                <InlineNumber
                    value={innerValue?.toString()}
                    onChange={(v) =>
                        setInnerValue(isDefined(v) ? parseFloat(v) : v)
                    }
                    onBlur={onBlur}
                    fallbackValue={min}
                    allowFractions
                />
                {unit}
            </div>
        </label>
    );
}
