import React, { useState } from 'react';
import clsx from 'clsx';
import { connectWithFormControlled } from '~/components/Form/common/connectWithForm';
import { ClassName, CommissionRange } from '~/utils/types';
import { useUpdateEffect } from '~/utils/hooks';
import { noOp } from '~/utils/basicHelpers';
import { RewardFractionField } from '../common/RewardFractionField/RewardFractionField';
import styles from '../common/RewardFractionField/RewardFractionField.module.scss';
import { InlineNumberProps } from '~/components/Form/InlineNumber/InlineNumber';

export interface CommissionRangeFieldProps
    extends Pick<InlineNumberProps, 'disabled' | 'readOnly' | 'isInvalid'>,
        ClassName {
    label: string;
    value: CommissionRange | undefined;
    display?: boolean;
    onChange?(v: Partial<CommissionRange>): void;
    onBlur?(): void;
}

export function CommissionRangeField({
    label,
    onChange = noOp,
    value,
    className,
    display = false,
    ...props
}: CommissionRangeFieldProps): JSX.Element {
    const { disabled, isInvalid, readOnly } = props;
    const [min, setMin] = useState<number | undefined>(value?.min);
    const [max, setMax] = useState<number | undefined>(value?.max);

    useUpdateEffect(() => {
        onChange({ min, max });
    }, [min, max]);
    useUpdateEffect(() => {
        setMin(value?.min);
        setMax(value?.max);
    }, [value]);

    return (
        <>
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
                {label}
            </label>
            <RewardFractionField
                label="Min:"
                value={min}
                onChange={setMin}
                {...props}
            />
            <RewardFractionField
                label="Max:"
                value={max}
                onChange={setMax}
                {...props}
            />
        </>
    );
}

export const FormCommissionRangeField = connectWithFormControlled<
    CommissionRange,
    CommissionRangeFieldProps
>(CommissionRangeField);
