import clsx from 'clsx';
import React, { InputHTMLAttributes } from 'react';
import Label from '~/components/Label';
import { noOp } from '~/utils/basicHelpers';
import { ClassName, MakeRequired } from '~/utils/types';
import { CommonInputProps } from '../common';
import ErrorMessage from '../ErrorMessage';

import styles from './Radios.module.scss';

interface RadioProps
    extends MakeRequired<CommonInputProps, 'label'>,
        Pick<
            InputHTMLAttributes<HTMLInputElement>,
            'onBlur' | 'onChange' | 'checked'
        > {
    id: string;
}

function Radio({ isInvalid, label, id, ...inputProps }: RadioProps) {
    return (
        <label className={styles.radio}>
            <input type="radio" value={id} {...inputProps} />
            <div>{label}</div>
        </label>
    );
}

interface Option<T> {
    label: string;
    value: T;
}

export interface RadiosProps<T = unknown> extends CommonInputProps, ClassName {
    options: Option<T>[];
    value: T | undefined;
    onChange(value: T): void;
    onBlur?(): void;
}

/**
 *  Use to select one of many options (as with <input type="radio" />). Is also to use within the context of a <Form /> on <Form.Radios />
 *
 *  @example
 *  const options = [{label: '1' value: 1}, {label: '2' value: 2}];
 *  const [val, setVal] = useState(1);
 *
 *  <Radios options={options} value={val} onChange={setVal} />
 */
function Radios<T>({
    options,
    value,
    error,
    label,
    className,
    onChange = noOp,
    ...inputProps
}: RadiosProps<T>) {
    const { isInvalid } = inputProps;
    return (
        <div className={clsx(styles.root, className)}>
            {label && <Label className="mB5">{label}</Label>}
            <div
                className={clsx(
                    styles.radios,
                    isInvalid && styles.radiosInvalid
                )}
            >
                {options.map((o, i) => (
                    <Radio
                        key={o.label}
                        checked={o.value === value}
                        id={`${i}`}
                        onChange={() => onChange(o.value)}
                        label={o.label}
                        {...inputProps}
                    />
                ))}
            </div>
            <ErrorMessage>{error}</ErrorMessage>
        </div>
    );
}

export default Radios;
