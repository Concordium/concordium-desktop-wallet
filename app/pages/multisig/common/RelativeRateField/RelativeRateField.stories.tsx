import React, { useState } from 'react';
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0';
import { RelativeRateField, RelativeRateFieldProps } from './RelativeRateField';
import { RelativeRateValue } from './util';

export default {
    title: 'Multi Signature/Common/Relative Rate Field',
    component: RelativeRateField,
} as Meta;

const Template: Story<RelativeRateFieldProps> = (args) => {
    const [value, setValue] = useState<RelativeRateValue>(args.value ?? {});

    return (
        <div style={{ width: '300px' }}>
            <RelativeRateField {...args} value={value} onChange={setValue} />
        </div>
    );
};

export const Primary = Template.bind({});
Primary.args = {
    denominatorUnit: { position: 'postfix', value: ' NRG' },
    label: 'New euro pr. energy rate',
    numeratorUnit: { value: '€ ', position: 'prefix' },
    value: { denominator: '1', numerator: '10' },
};

export const Invalid = Template.bind({});
Invalid.args = {
    denominatorUnit: { position: 'postfix', value: ' NRG' },
    label: 'New euro pr. energy rate',
    numeratorUnit: { value: '€ ', position: 'prefix' },
    value: { denominator: '1', numerator: '-10' },
    isInvalid: true,
    error: "Value can't be negative",
};

export const Disabled = Template.bind({});
Disabled.args = {
    denominatorUnit: { position: 'postfix', value: ' NRG' },
    label: 'New euro pr. energy rate',
    numeratorUnit: { value: '€ ', position: 'prefix' },
    value: { denominator: '1', numerator: '10' },
    disabled: true,
};
