import React, { useState } from 'react';
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0';
import { RelativeRateField, RelativeRateFieldProps } from './RelativeRateField';
import { isValidBigInt } from './validation';

export default {
    title: 'Multi Signature/Common/Relative Rate Field',
    component: RelativeRateField,
} as Meta;

const Template: Story<RelativeRateFieldProps> = (args) => {
    const [value, setValue] = useState<string | undefined>(args.value);
    const denominator = 10n; // BigInt can't be set through args, as it can't be serialized by storybook.

    const isInvalid = !value || !isValidBigInt(value); // An example of how to validate the field.

    return (
        <div style={{ width: '300px' }}>
            {denominator?.toString()}, {value?.toString()}
            <RelativeRateField
                {...args}
                denominator={denominator}
                value={value}
                onChange={setValue}
                isInvalid={isInvalid}
            />
        </div>
    );
};

export const Primary = Template.bind({});
Primary.args = {
    denominatorUnit: { position: 'postfix', value: ' NRG' },
    label: 'New euro pr. energy rate',
    unit: { value: '€ ', position: 'prefix' },
    value: '1234',
};

export const Normalised = Template.bind({});
Normalised.args = {
    denominatorUnit: { position: 'postfix', value: ' NRG' },
    label: 'New euro pr. energy rate',
    unit: { value: '€ ', position: 'prefix' },
    value: '1234',
    normaliseTo: 1,
};

export const Invalid = Template.bind({});
Invalid.args = {
    denominatorUnit: { position: 'postfix', value: ' NRG' },
    label: 'New euro pr. energy rate',
    unit: { value: '€ ', position: 'prefix' },
    value: '-1234',
    isInvalid: true,
    error: "Value can't be negative",
};

export const Disabled = Template.bind({});
Disabled.args = {
    denominatorUnit: { position: 'postfix', value: ' NRG' },
    label: 'New euro pr. energy rate',
    unit: { value: '€ ', position: 'prefix' },
    value: '1234',
    normaliseTo: 1,
    disabled: true,
};
