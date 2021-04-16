import React from 'react';
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0';
import { FormProvider, useForm } from 'react-hook-form';
import InflationInput, { InflationInputProps } from './InflationInput';

export default {
    title: 'Multi Signature/Update Mint Distribution/Inflation Input',
    component: InflationInput,
} as Meta;

const Template: Story<InflationInputProps> = (args) => {
    const form = useForm();

    return (
        <FormProvider {...form}>
            <InflationInput {...args} />
        </FormProvider>
    );
};

export const Primary = Template.bind({});
Primary.args = {
    mantissa: '123456789',
    exponent: '-12',
    slotsPerYear: '126144000',
};

export const Disabled = Template.bind({});
Disabled.args = {
    mantissa: '123456789',
    exponent: '-12',
    slotsPerYear: '126144000',
    disabled: true,
};
