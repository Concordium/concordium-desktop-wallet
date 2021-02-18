import React, { ComponentType, RefAttributes } from 'react';
import {
    ControllerRenderProps,
    RegisterOptions,
    useController,
    UseControllerOptions,
    useFormContext,
} from 'react-hook-form';
import { FieldCommonProps } from '.';

type ValidRef = RefAttributes<
    HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
>;

type UncontrolledFieldProps = FieldCommonProps & ValidRef;

interface UncontrolledConnectorProps {
    rules?: RegisterOptions;
}

export function connectWithFormUncontrolled<
    TProps extends UncontrolledFieldProps
>(
    Field: ComponentType<TProps>
): (
    props: UncontrolledConnectorProps & Omit<TProps, 'ref' | 'error'>
) => JSX.Element {
    // eslint-disable-next-line react/display-name
    return ({ rules, name, ...props }) => {
        const { register, errors } = useFormContext();

        const fieldProps: TProps = {
            ref: register(rules),
            name,
            error: errors[name],
            ...props,
        } as TProps;

        return <Field {...fieldProps} />;
    };
}

interface ControlledFieldProps<TValue>
    extends FieldCommonProps,
        Pick<ControllerRenderProps, 'onChange' | 'onBlur'> {
    value: TValue;
}
type ControlledConnectorProps = Omit<
    UseControllerOptions,
    'onFocus' | 'control'
>;

export function connectWithFormControlled<
    TValue,
    TProps extends ControlledFieldProps<TValue>
>(
    Field: ComponentType<TProps>
): (props: Omit<TProps, 'error'> & ControlledConnectorProps) => JSX.Element {
    return ({ name, rules, defaultValue, ...props }) => {
        const { control, errors } = useFormContext();
        const {
            field: { ref, ...fieldProps },
        } = useController({ name, rules, defaultValue, control });

        const p: TProps = {
            error: errors[name],
            ...fieldProps,
            ...props,
        } as TProps;

        return <Field {...p} />;
    };
}
