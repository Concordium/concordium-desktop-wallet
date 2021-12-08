import clsx from 'clsx';
import React, { forwardRef, InputHTMLAttributes } from 'react';
import Label from '~/components/Label';
import { isDefined, noOp } from '~/utils/basicHelpers';
import { ClassName, MakeRequired, NotOptional } from '~/utils/types';
import { CommonInputProps } from '../common';

import styles from './Radios.module.scss';

interface RadioProps
    extends MakeRequired<CommonInputProps, 'label'>,
        Pick<
            InputHTMLAttributes<HTMLInputElement>,
            'onBlur' | 'onChange' | 'defaultChecked' | 'checked'
        > {
    value: string;
}

const Radio = forwardRef<HTMLInputElement, RadioProps>(
    ({ isInvalid, label, ...inputProps }, ref) => {
        const id = `radio-${inputProps.value}`;

        return (
            <div className={styles.radio}>
                <input id={id} ref={ref} type="radio" {...inputProps} />
                <label htmlFor={id}>{label}</label>
            </div>
        );
    }
);

Radio.displayName = 'Radio';

interface Props
    extends Pick<RadioProps, 'onBlur'>,
        CommonInputProps,
        ClassName {
    options: NotOptional<Pick<RadioProps, 'value' | 'label'>>[];
    value?: string;
    defaultValue?: string;
    onChange?(value: string): void;
}

const Radios = forwardRef<HTMLInputElement, Props>(
    (
        {
            options,
            value,
            defaultValue,
            error,
            label,
            className,
            onChange = noOp,
            ...inputProps
        },
        ref
    ) => {
        return (
            <div className={clsx(styles.root, className)}>
                <Label className="mB5">{label}</Label>
                <div className={styles.radios}>
                    {options.map((o) => (
                        <Radio
                            key={o.value}
                            ref={ref}
                            defaultChecked={defaultValue === o.value}
                            checked={
                                isDefined(value) ? o.value === value : undefined
                            }
                            onChange={(e) => onChange(e.target.value)}
                            {...o}
                            {...inputProps}
                        />
                    ))}
                </div>
            </div>
        );
    }
);

Radios.displayName = 'Radios';

export default Radios;
