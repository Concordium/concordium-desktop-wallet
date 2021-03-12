import clsx from 'clsx';
import React, { InputHTMLAttributes } from 'react';
import { NotOptional } from '../../../utils/types';

import styles from './RewardDistribution.module.scss';

interface RewardDistributionFieldProps
    extends NotOptional<
            Pick<
                InputHTMLAttributes<HTMLInputElement>,
                'onChange' | 'onBlur' | 'value'
            >
        >,
        Pick<InputHTMLAttributes<HTMLInputElement>, 'readOnly' | 'className'> {
    label: string;
}

export default function RewardDistributionField({
    label,
    className,
    ...inputProps
}: RewardDistributionFieldProps): JSX.Element {
    return (
        <label className={clsx(styles.field, className)}>
            {label}
            <input {...inputProps} />
        </label>
    );
}
