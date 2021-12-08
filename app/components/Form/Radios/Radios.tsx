import React, { forwardRef, InputHTMLAttributes } from 'react';
import Label from '~/components/Label';
import { isDefined, noOp } from '~/utils/basicHelpers';
import { MakeRequired, NotOptional } from '~/utils/types';
import { CommonInputProps } from '../common';

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
        return (
            <label>
                <input ref={ref} type="radio" {...inputProps} />
                {label}
            </label>
        );
    }
);

Radio.displayName = 'Radio';

interface Props extends Pick<RadioProps, 'onBlur'>, CommonInputProps {
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
            onChange = noOp,
            ...inputProps
        },
        ref
    ) => {
        return (
            <div>
                <Label>{label}</Label>
                <div>
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
