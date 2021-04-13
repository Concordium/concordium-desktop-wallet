import React, { useState } from 'react';
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0';
import { ExchangeRate } from '~/utils/types';
import { RelativeRateField, RelativeRateFieldProps } from './RelativeRateField';

export default {
    title: 'Multi Signature/Common/Relative Rate Field',
    component: RelativeRateField,
} as Meta;

const Template: Story<RelativeRateFieldProps> = (args) => {
    const [value, setValue] = useState<ExchangeRate | undefined>({
        denominator: 1n,
        numerator: 1234n,
    });

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
};

export const Invalid = Template.bind({});
Invalid.args = {
    denominatorUnit: { position: 'postfix', value: ' NRG' },
    label: 'New euro pr. energy rate',
    unit: { value: '€ ', position: 'prefix' },
    isInvalid: true,
    error: 'Field is required',
};

export const Disabled = Template.bind({});
Disabled.args = {
    denominatorUnit: { position: 'postfix', value: ' NRG' },
    label: 'New euro pr. energy rate',
    unit: { value: '€ ', position: 'prefix' },
    disabled: true,
};
