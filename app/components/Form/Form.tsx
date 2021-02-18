import React, { FormHTMLAttributes, PropsWithChildren } from 'react';
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import Checkbox from './Checkbox';

import { connectWithFormUncontrolled } from './common/connectWithForm';
import Input from './Input';
import TextArea from './TextArea';

interface FormProps<TFormValues>
    extends Omit<FormHTMLAttributes<HTMLFormElement>, 'onSubmit'> {
    onSubmit: SubmitHandler<TFormValues>;
}

export default function Form<T extends Record<string, unknown>>({
    children,
    onSubmit,
    ...formProps
}: PropsWithChildren<FormProps<T>>): JSX.Element {
    const { ...methods } = useForm<T>({
        mode: 'onTouched',
    });

    return (
        <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} {...formProps}>
                {children}
            </form>
        </FormProvider>
    );
}

Form.Input = connectWithFormUncontrolled(Input);
Form.TextArea = connectWithFormUncontrolled(TextArea);
Form.Checkbox = connectWithFormUncontrolled(Checkbox);
