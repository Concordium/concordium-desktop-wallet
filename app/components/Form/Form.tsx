import React, { ComponentType, PropsWithChildren } from 'react';
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';

import { connectWithFormUncontrolled } from './common/connectWithForm';
import Input from './Input';

interface FormProps<TFormValues> {
    onSubmit: SubmitHandler<TFormValues>;
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
