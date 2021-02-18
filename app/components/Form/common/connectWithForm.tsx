import React, { ComponentType, FC, RefAttributes } from 'react';
import {
    ControllerRenderProps,
    RegisterOptions,
    useController,
    UseControllerOptions,
    useFormContext,
} from 'react-hook-form';
import { FieldCommonProps } from '.';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getDisplayName(Field: ComponentType<any>): string {
    return `Connected${Field.displayName ?? 'Field'}`;
}

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
    const Connected: ReturnType<typeof connectWithFormUncontrolled> = ({
        rules,
        name,
        ...props
    }) => {
        const { register, errors } = useFormContext();

        const fieldProps: TProps = {
            ref: register(rules),
            name,
            error: errors[name],
            ...props,
        } as TProps;

        return <Field {...fieldProps} />;
    };

    (Connected as FC).displayName = getDisplayName(Field);

    return Connected;
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
    const Connected: ReturnType<typeof connectWithFormControlled> = ({
        name,
        rules,
        defaultValue,
        ...props
    }) => {
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

    (Connected as FC).displayName = getDisplayName(Field);

    return Connected;
}
