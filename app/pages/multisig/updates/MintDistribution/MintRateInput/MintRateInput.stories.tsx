import React from 'react';
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0';
import { FormProvider, useForm } from 'react-hook-form';
import MintRateInput, { MintRateInputProps } from './MintRateInput';

export default {
    title: 'Multi Signature/Update Mint Distribution/Mint Rate Input',
    component: MintRateInput,
} as Meta;

const Template: Story<MintRateInputProps> = (args) => {
    const form = useForm();

    return (
        <FormProvider {...form}>
            <MintRateInput {...args} />
        </FormProvider>
    );
};

export const Primary = Template.bind({});
Primary.args = {
    mantissa: '123',
    exponent: '-12',
    slotsPerYear: '126144000',
};

export const Disabled = Template.bind({});
Disabled.args = {
    mantissa: '123',
    exponent: '-12',
    slotsPerYear: '126144000',
    disabled: true,
};
