import React, { FC, FormHTMLAttributes, PropsWithChildren } from 'react';
import {
    FormProvider,
    SubmitHandler,
    useForm,
    UseFormMethods,
} from 'react-hook-form';

import Switch from '../../cross-app-components/Switch';
import {
    connectWithFormControlled,
    connectWithFormUncontrolled,
} from './common/connectWithForm';
import Input from './Input';
import Checkbox from './Checkbox';
import TextArea from './TextArea';
import Submit from './Submit';
import InputTimestamp, {
    InputTimestampProps,
} from './InputTimestamp/InputTimestamp';
import FileInput from './FileInput';
import { FileInputProps, FileInputValue } from './FileInput/FileInput';
import InlineNumber, { InlineNumberProps } from './InlineNumber/InlineNumber';

export type FormProps<TFormValues> = Omit<
    FormHTMLAttributes<HTMLFormElement>,
    'onSubmit'
> & {
    formMethods?: UseFormMethods<TFormValues>;
    onSubmit: SubmitHandler<TFormValues>;
};

/**
 * @description
 * Use this to take advantage of automatic validation of form inputs based on rules supplied to individual elements.
 * Don't use this if you simply need an input element for DOM manipulation of some sort (i.e. filtering a list).
 *
 * Individual inputs are available as subcomponents of this:
 *
 * <Form.Input />, <Form.TextArea />, <Form.Checkbox />, <Form.Switch />
 *
 * @example
 * interface FormValues {
 *   name?: string;
 *   email: string;
 *   phone?: string;
 * }
 *
 * function handleSubmit(values: FormValues): void {
 *   ...
 * }
 *
 * <Form<FormValues> onSubmit={handleSubmit}>
 *   <Form.Input name="name" />
 *   <Form.Input type="email" name="email" rules={{ required: 'You must supply an e-mail address' }} />
 *   <Form.TextArea name="comment" rules={{ maxLength: { value: 255, message: 'You cannot enter more than 255 characters' } }} />
 *   <Form.Checkbox name="agree" rules={{ required: 'You must agree to this' }}>Agree to terms</Form.Checkbox>
 *   <Form.Submit>Submit</Form.Submit>
 * </Form>
 */
function Form<TFormValues>({
    children,
    formMethods,
    onSubmit,
    ...formProps
}: PropsWithChildren<FormProps<TFormValues>>): JSX.Element {
    const methods = useForm<TFormValues>({
        mode: 'onTouched',
    });

    const { handleSubmit } = formMethods ?? methods;

    return (
        <FormProvider {...(formMethods ?? methods)}>
            <form onSubmit={handleSubmit(onSubmit)} {...formProps} noValidate>
                {children}
            </form>
        </FormProvider>
    );
}

Form.Input = connectWithFormUncontrolled(Input);
(Form.Input as FC).displayName = 'Form.Input';

Form.TextArea = connectWithFormUncontrolled(TextArea);
(Form.TextArea as FC).displayName = 'Form.TextArea';

Form.Checkbox = connectWithFormUncontrolled(Checkbox);
(Form.Checkbox as FC).displayName = 'Form.Checkbox';

Form.Switch = connectWithFormUncontrolled(Switch);
(Form.Switch as FC).displayName = 'Form.Switch';

Form.File = connectWithFormControlled<FileInputValue, FileInputProps>(
    FileInput
);
(Form.File as FC).displayName = 'Form.File';

Form.InlineNumber = connectWithFormControlled<string, InlineNumberProps>(
    InlineNumber
);
(Form.InlineNumber as FC).displayName = 'Form.InlineNumber';

Form.Timestamp = connectWithFormControlled<Date, InputTimestampProps>(
    InputTimestamp
);
(Form.Timestamp as FC).displayName = 'Form.Timestamp';

Form.Submit = Submit;
(Form.Submit as FC).displayName = 'Form.Submit';

export default Form;
