import React from 'react';
import { Story, Meta } from '@storybook/react/types-6-0';

import Form, { FormProps } from '../Form';
import { futureDate } from '../util/validation';
import { maxFileSizeKb } from '../FileInput/validation';
import { getGTUSymbol } from '~/utils/gtu';

export const {
    Checkbox,
    Input,
    Submit,
    Switch,
    TextArea,
    Timestamp,
    File,
    InlineNumber,
} = Form;

export const argTypes: Meta['argTypes'] = {
    children: {
        children: {
            description:
                'Can be anything, most often sub components accessible on Form',
            control: {
                type: null,
            },
        },
    },
};

export const subcomponents: Meta['subcomponents'] = {
    'Form.Input': Input,
    'Form.TextArea': TextArea,
    'Form.Checkbox': Checkbox,
    'Form.Switch': Switch,
    'Form.InlineNumber': InlineNumber,
    'Form.Timestamp': Timestamp,
    'Form.File': File,
    'Form.Submit': Submit,
};

export const decorators = [
    (story: () => JSX.Element) => (
        <>
            <style>
                {`
                    .sb-form-wrapper {
                        max-width: 400px;
                        margin: 0 auto;
                    }
                `}
            </style>
            <div className="sb-form-wrapper">{story()}</div>
        </>
    ),
];

export const Template: Story<FormProps> = (args) => (
    <Form {...args}>
        <Form.Input name="name" placeholder="Name" />
        <Form.Input type="email" name="email" placeholder="Email" />
        <Form.Input type="phone" name="phone" placeholder="Phone" />
        <Form.Checkbox name="terms">Agree to terms</Form.Checkbox>
        <Form.Submit>Submit</Form.Submit>
    </Form>
);

export const ValidationTemplate: Story<FormProps> = (args) => (
    <Form {...args}>
        <Form.Input name="name" placeholder="Name" />
        <Form.Input
            name="email"
            type="email"
            placeholder="E-mail"
            rules={{ required: 'Email is required to sign up.' }}
        />
        <Form.File
            name="file"
            placeholder="Drag and drop file here"
            buttonTitle="or browse to file"
            rules={{
                required: 'File is required',
                validate: maxFileSizeKb(1, 'File size too big (1kb allowed)'),
            }}
        />
        <Form.Timestamp
            name="time"
            rules={{
                required: 'Field is required',
                validate: futureDate(),
            }}
        />
        <div>
            Please send {getGTUSymbol()}
            <Form.InlineNumber
                name="gtuAmount"
                rules={{ required: true, min: 0 }}
            />{' '}
            to John.
        </div>
        <Form.Checkbox
            name="terms"
            rules={{ required: 'You must agree to the terms' }}
        >
            Agree to terms
        </Form.Checkbox>
        <Form.Submit>Submit</Form.Submit>
    </Form>
);

export const AllFieldsTemplate: Story<FormProps> = (args) => (
    <Form {...args}>
        <Form.Input name="name" placeholder="Name" />
        <Form.TextArea name="comment" placeholder="Comment" />
        <Form.Timestamp
            name="time"
            rules={{
                required: 'Field is required',
                validate: futureDate(),
            }}
        />
        <Form.Checkbox
            name="terms"
            rules={{ required: 'You must agree to the terms' }}
        >
            Agree to terms
        </Form.Checkbox>
        <Form.Switch name="setting">Enable setting</Form.Switch>
        <div>
            Please send {getGTUSymbol()}
            <Form.InlineNumber name="gtuAmount" /> to John.
        </div>
        <Form.Submit>Submit</Form.Submit>
    </Form>
);
