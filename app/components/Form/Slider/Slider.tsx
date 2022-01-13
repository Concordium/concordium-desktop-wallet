import React, { useEffect, useState } from 'react';
import RcSlider from 'rc-slider';
import clsx from 'clsx';
import { CommonInputProps } from '../common';
import InlineNumber from '../InlineNumber';
import { isDefined, noOp, valueNoOp } from '~/utils/basicHelpers';
import Label from '~/components/Label';
import { ClassName } from '~/utils/types';
import { toFixed } from '~/utils/numberStringHelpers';

import styles from './Slider.module.scss';

interface Props extends CommonInputProps, ClassName {
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
    className,
    isInvalid,
}: Props) {
    const [innerValue, setInnerValue] = useState<number | undefined>(value);

    const allowFractions = step < 1 && step > 0;
    const ensureDigits = allowFractions
        ? step.toString().split('.')[1].length
        : undefined;
    const formatNumber = ensureDigits ? toFixed(ensureDigits) : valueNoOp;

    useEffect(() => {
        onChange(innerValue);
    }, [innerValue, onChange]);

    return (
        <label
            className={clsx(
                styles.root,
                isInvalid && styles.invalid,
                className
            )}
        >
            <Label className="mB5">{label}</Label>
            <div className={styles.grid}>
                <span>
                    Min:
                    <br />
                    {formatNumber(min.toString())}
                    {unit}
                </span>
                <RcSlider
                    className={styles.slider}
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
                    {formatNumber(max.toString())}
                    {unit}
                </span>
                <div className={styles.inputWrapper}>
                    <InlineNumber
                        className={styles.input}
                        value={innerValue?.toString()}
                        onChange={(v) =>
                            setInnerValue(isDefined(v) ? parseFloat(v) : v)
                        }
                        onBlur={onBlur}
                        fallbackValue={min}
                        allowFractions={ensureDigits ?? false}
                        ensureDigits={ensureDigits}
                    />
                    {unit}
                </div>
            </div>
        </label>
    );
}
