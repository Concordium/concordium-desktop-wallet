import React, { useEffect, useState } from 'react';
import RcSlider from 'rc-slider';
import clsx from 'clsx';
import { CommonInputProps } from '../common';
import InlineNumber from '../InlineNumber';
import { isDefined, noOp } from '~/utils/basicHelpers';
import Label from '~/components/Label';
import { ClassName } from '~/utils/types';

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
}: Props) {
    const [innerValue, setInnerValue] = useState<number | undefined>(value);

    useEffect(() => {
        onChange(innerValue);
    }, [innerValue, onChange]);

    return (
        <label className={clsx(styles.root, className)}>
            <Label className="mB5">{label}</Label>
            <div className={styles.grid}>
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
                <div className={styles.input}>
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
            </div>
        </label>
    );
}
