import React, { useState } from 'react';
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0';
import { RelativeRateField, RelativeRateFieldProps } from './RelativeRateField';

export default {
    title: 'Multi Signature/Common/Relative Rate Field',
    component: RelativeRateField,
} as Meta;

const Template: Story<RelativeRateFieldProps> = (args) => {
    const [value, setValue] = useState<string | undefined>(args.value);

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
    unit: { value: '€ ', position: 'prefix' },
    denominator: '1',
    value: '1234',
};

export const Normalised = Template.bind({});
Normalised.args = {
    denominatorUnit: { position: 'postfix', value: ' NRG' },
    label: 'New euro pr. energy rate',
    unit: { value: '€ ', position: 'prefix' },
    denominator: '1',
    value: '123.4',
    ensureDigits: 2,
    allowFractions: true,
};

export const Invalid = Template.bind({});
Invalid.args = {
    denominator: '1.00',
    denominatorUnit: { position: 'postfix', value: ' NRG' },
    label: 'New euro pr. energy rate',
    unit: { value: '€ ', position: 'prefix' },
    value: '-1234',
    isInvalid: true,
    error: "Value can't be negative",
};

export const Disabled = Template.bind({});
Disabled.args = {
    denominator: '10',
    denominatorUnit: { position: 'postfix', value: ' NRG' },
    label: 'New euro pr. energy rate',
    unit: { value: '€ ', position: 'prefix' },
    value: '1234',
    disabled: true,
};
