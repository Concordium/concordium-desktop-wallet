import React, { ComponentType, FC, RefAttributes } from 'react';
import {
    ControllerRenderProps,
    FieldError,
    RegisterOptions,
    useController,
    UseControllerOptions,
    useFormContext,
} from 'react-hook-form';
import { CommonFieldProps } from '.';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getDisplayName(Field: ComponentType<any>): string {
    return `Connected${Field.displayName ?? 'Field'}`;
}

interface CommonConnectorProps {
    name: string;
}

type ValidRef = RefAttributes<
    HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
>;

type UncontrolledFieldProps = CommonFieldProps & ValidRef;

interface UncontrolledConnectorProps extends CommonConnectorProps {
    rules?: RegisterOptions;
}

/**
 * @description
 * HOC for creating form field components hooked up to the <Form /> component.
 * Use this when hooking up a component based on an uncontrolled input (uses ref).
 *
 * @example
 * const UncontrolledField = forwardRef<HTMLInputElement, CommonFieldProps>((props, ref) => <input {...props} ref={ref} />);
 * const Connected = connectWithFormUncontrolled(UncontrolledField);
 */
export function connectWithFormUncontrolled<
    TProps extends UncontrolledFieldProps
>(
    Field: ComponentType<TProps>
): (
    props: Omit<TProps, 'ref' | 'error' | 'isInvalid'> &
        UncontrolledConnectorProps
) => JSX.Element {
    const Connected: ReturnType<typeof connectWithFormUncontrolled> = ({
        rules,
        name,
        ...props
    }) => {
        const { register, errors } = useFormContext();

        const error: FieldError | undefined = errors[name];
        const fieldProps: TProps = {
            ref: register(rules),
            name,
            error: error?.message,
            isInvalid: !!error,
            ...props,
        } as TProps;

        return <Field {...fieldProps} />;
    };

    (Connected as FC).displayName = getDisplayName(Field);

    return Connected;
}

interface ControlledFieldProps<TValue>
    extends CommonFieldProps,
        Partial<Pick<ControllerRenderProps, 'onBlur' | 'onChange'>> {
    value: TValue | undefined;
}
interface ControlledConnectorProps<TValue>
    extends CommonConnectorProps,
        Omit<UseControllerOptions, 'onFocus' | 'control'> {
    defaultValue?: TValue;
}

/**
 * @description
 * HOC for creating form field components hooked up to the <Form /> component.
 * Use this when hooking up a component based on controlled input (value, onChange).
 *
 * @example
 * interface Props {
 *   value: string;
 *   onChange: React.ChangeEventHandler<HTMLInputElement>;
 * }
 *
 * const ControlledField = (props: Props) => <input {...props} />;
 * const Connected = connectWithFormControlled(ControlledField);
 */
export function connectWithFormControlled<
    TValue,
    TProps extends ControlledFieldProps<TValue>
>(
    Field: ComponentType<TProps>
): (
    props: Omit<
        TProps,
        'error' | 'onChange' | 'onBlur' | 'value' | 'isInvalid'
    > &
        ControlledConnectorProps<TValue>
) => JSX.Element {
    const Connected: ReturnType<typeof connectWithFormControlled> = ({
        name,
        rules,
        defaultValue,
        ...props
    }) => {
        const { control, errors } = useFormContext();
        const {
            field: { ref, ...fieldProps },
            meta: { invalid },
        } = useController({ name, rules, defaultValue, control });

        const error: FieldError | undefined = errors[name];
        const p: TProps = {
            isInvalid: invalid,
            error: error?.message,
            ...fieldProps,
            ...props,
        } as TProps;

        return <Field {...p} />;
    };

    (Connected as FC).displayName = getDisplayName(Field);

    return Connected;
}
