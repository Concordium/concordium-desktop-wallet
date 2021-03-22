import React, { useState } from 'react';
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0';
import RelativeRateField, { RelativeRateFieldProps } from './RelativeRateField';

export default {
    title: 'Components/Form/Fields/Relative Rate Field',
    component: RelativeRateField,
} as Meta;

const Template: Story<RelativeRateFieldProps> = (args) => {
    const [value, setValue] = useState(args.value);
    return (
        <div style={{ width: '300px' }}>
            <RelativeRateField {...args} value={value} onChange={setValue} />
        </div>
    );
};

export const Primary = Template.bind({});
Primary.args = {
    denominatorUnit: 'NRG',
    label: 'New euro pr. energy rate',
    unit: '€',
    value: { denominator: 100n, numerator: 1234n },
};

export const Invalid = Template.bind({});
Invalid.args = {
    denominatorUnit: 'NRG',
    label: 'New euro pr. energy rate',
    unit: '€',
    isInvalid: true,
    error: 'Field is required',
};

export const Disabled = Template.bind({});
Disabled.args = {
    denominatorUnit: 'NRG',
    label: 'New euro pr. energy rate',
    unit: '€',
    disabled: true,
    value: { denominator: 100n, numerator: 1234n },
};
