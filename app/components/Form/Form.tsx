import React, { ComponentType, PropsWithChildren } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { connectWithFormUncontrolled } from './common/connectWithForm';
import Input from './Input/Input';

interface FormProps<T extends Record<string, unknown>> {
    onSubmit(values: T): void;
}

export default function Form<T extends Record<string, unknown>>({
    children,
    onSubmit,
}: PropsWithChildren<FormProps<T>>): JSX.Element {
    const { ...methods } = useForm<T>({
        mode: 'onTouched',
    });

    return (
        <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)}>{children}</form>
        </FormProvider>
    );
}

Form.Input = connectWithFormUncontrolled(Input);
(Form.Input as ComponentType).displayName = 'ConnectedInput';
