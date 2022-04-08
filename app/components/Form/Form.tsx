import React, { FC, FormHTMLAttributes, PropsWithChildren } from 'react';
import {
    DefaultValues,
    FieldValues,
    FormProvider,
    SubmitHandler,
    useForm,
    UseFormMethods,
} from 'react-hook-form';

import Switch from '~/cross-app-components/Switch';
import { PropsOf } from '~/utils/types';
import {
    connectWithFormControlled,
    connectWithFormUncontrolled,
} from './common/connectWithForm';
import Input from './Input';
import Checkbox from './Checkbox';
import TextArea from './TextArea';
import Submit from './Submit';
import FileInput from './FileInput';
import { FileInputProps, FileInputValue } from './FileInput/FileInput';
import InlineNumber, { InlineNumberProps } from './InlineNumber';
import CcdInput, { CcdInputProps } from './CcdInput';
import InlineInput, { InlineInputProps } from './InlineInput';
import DatePicker from './DatePicker';
import Radios, { RadiosProps } from './Radios';
import Slider from './Slider';

export type FormProps<TFormValues extends FieldValues = FieldValues> = Omit<
    FormHTMLAttributes<HTMLFormElement>,
    'onSubmit'
> & {
    formMethods?: UseFormMethods<TFormValues>;
    onSubmit: SubmitHandler<TFormValues>;
    defaultValues?: DefaultValues<TFormValues>;
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
function Form<TFormValues extends FieldValues = FieldValues>({
    children,
    formMethods,
    onSubmit,
    defaultValues,
    ...formProps
}: PropsWithChildren<FormProps<TFormValues>>): JSX.Element {
    const methods = useForm<TFormValues>({
        mode: 'onTouched',
        defaultValues,
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

Form.Radios = connectWithFormControlled<unknown, RadiosProps>(Radios);
(Form.Radios as FC).displayName = 'Form.Radios';

Form.File = connectWithFormControlled<FileInputValue, FileInputProps>(
    FileInput
);
(Form.File as FC).displayName = 'Form.File';

Form.InlineNumber = connectWithFormControlled<string, InlineNumberProps>(
    InlineNumber
);
(Form.InlineNumber as FC).displayName = 'Form.InlineNumber';

Form.CcdInput = connectWithFormControlled<string, CcdInputProps>(CcdInput);
(Form.CcdInput as FC).displayName = 'Form.GtuInput';

Form.InlineInput = connectWithFormControlled<string, InlineInputProps>(
    InlineInput
);
(Form.InlineInput as FC).displayName = 'Form.InlineInput';

Form.DatePicker = connectWithFormControlled<Date, PropsOf<typeof DatePicker>>(
    DatePicker
);
(Form.DatePicker as FC).displayName = 'Form.DatePicker';

Form.Slider = connectWithFormControlled<number, PropsOf<typeof Slider>>(Slider);
(Form.Slider as FC).displayName = 'Form.Slider';

Form.Submit = Submit;
(Form.Submit as FC).displayName = 'Form.Submit';

export default Form;
