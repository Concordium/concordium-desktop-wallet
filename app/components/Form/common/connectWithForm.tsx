import React, {
    ComponentType,
    FC,
    forwardRef,
    ForwardRefExoticComponent,
    RefAttributes,
    useCallback,
} from 'react';
import {
    ControllerRenderProps,
    FieldError,
    RegisterOptions,
    useController,
    UseControllerOptions,
    useFormContext,
} from 'react-hook-form';
import { noOp } from '~/utils/basicHelpers';
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
    Field: ComponentType<TProps> | ForwardRefExoticComponent<TProps>
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
        'error' | 'value' | 'isInvalid' | 'onChange' | 'onBlur'
    > &
        Partial<Pick<TProps, 'onChange' | 'onBlur'>> &
        ControlledConnectorProps<TValue>
) => JSX.Element | null {
    const Connected: ReturnType<typeof connectWithFormControlled> = forwardRef(
        (
            {
                name,
                rules,
                defaultValue,
                onBlur = noOp,
                onChange = noOp,
                ...props
            },
            ref
        ) => {
            const { control, errors } = useFormContext();
            const {
                field: {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    ref: _,
                    onBlur: cBlur,
                    onChange: cChange,
                    ...fieldProps
                },
                meta: { invalid },
            } = useController({ name, rules, defaultValue, control });

            const handleBlur = useCallback(() => {
                onBlur();
                cBlur();
            }, [onBlur, cBlur]);

            const handleChange: typeof onChange = useCallback(
                (...e) => {
                    onChange(...e);
                    cChange(...e);
                },
                [onChange, cChange]
            );

            const error: FieldError | undefined = errors[name];
            const p: TProps = {
                isInvalid: invalid,
                error: error?.message,
                onBlur: handleBlur,
                onChange: handleChange,
                ...fieldProps,
                ...props,
            } as TProps;

            return <Field {...p} ref={ref} />;
        }
    );

    return Connected;
}
