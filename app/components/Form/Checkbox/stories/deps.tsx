/* eslint-disable import/prefer-default-export */
import React from 'react';
import { ArgTypes, Story } from '@storybook/react/types-6-0';

import Checkbox, { CheckboxProps } from '../Checkbox';

export const argTypes: ArgTypes = {
    onChange: {
        description:
            'EventHandler corresponding to that of &lt;input type="checkbox" /&gt;',
    },
    error: {
        description:
            'If set to anything other than undefined, renders field as invalid.',
    },
    children: {
        description: 'Renders as label for the checkbox',
    },
    checked: {
        description:
            'Use with onChange() to use the component as a controlled field',
    },
};

export const Template: Story<CheckboxProps> = (args) => <Checkbox {...args} />;
