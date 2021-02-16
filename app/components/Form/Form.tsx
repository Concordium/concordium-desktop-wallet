import React, { PropsWithChildren } from 'react';
import {
    DeepPartial,
    FormProvider,
    UnpackNestedValue,
    useForm,
} from 'react-hook-form';

interface FormProps<T extends Record<string, unknown>> {
    defaultValues: UnpackNestedValue<DeepPartial<T>>;
    onSubmit(values: T): void;
}

export default function Form<T extends Record<string, unknown>>({
    children,
    defaultValues,
    onSubmit,
}: PropsWithChildren<FormProps<T>>): JSX.Element {
    const { ...methods } = useForm<T>({
        defaultValues,
        mode: 'onTouched',
    });

    return (
        <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)}>{children}</form>
        </FormProvider>
    );
}
