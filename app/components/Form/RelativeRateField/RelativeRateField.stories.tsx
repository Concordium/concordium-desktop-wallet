import React from 'react';
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0';
import RelativeRateField, { RelativeFieldProps } from './RelativeRateField';

export default {
    title: 'Components/Form/Fields/Relative Rate Field',
    component: RelativeRateField,
} as Meta;

const Template: Story<RelativeFieldProps> = (args) => (
    <div style={{ width: '300px' }}>
        <RelativeRateField {...args} />
    </div>
);

export const Primary = Template.bind({});
Primary.args = {
    relativeTo: '1 NRG',
    label: 'New euro pr. energy rate',
    unit: '€',
};

export const Invalid = Template.bind({});
Invalid.args = {
    relativeTo: '1 NRG',
    label: 'New euro pr. energy rate',
    unit: '€',
    isInvalid: true,
    error: 'Field is required',
};

export const Disabled = Template.bind({});
Disabled.args = {
    relativeTo: '1 NRG',
    label: 'New euro pr. energy rate',
    unit: '€',
    disabled: true,
    value: '1.234',
};
