import React from 'react';
import { Story, Meta } from '@storybook/react/types-6-0';

import Form, { FormProps } from '../Form';

export const { Checkbox, Input, Submit, Switch, TextArea } = Form;

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
    'Form.Submit': Submit,
};

export const Template: Story<FormProps<unknown>> = (args) => (
    <Form {...args}>
        <Form.Input name="name" placeholder="Name" />
        <br />
        <Form.Input type="email" name="email" placeholder="Email" />
        <br />
        <Form.Input type="phone" name="phone" placeholder="Phone" />
        <Form.Checkbox name="terms">Agree to terms</Form.Checkbox>
        <Form.Submit>Submit</Form.Submit>
    </Form>
);
