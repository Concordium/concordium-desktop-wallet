import React, { useState } from 'react';
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0';
import MintRateInput, { MintRateInputProps } from './MintRateInput';

export default {
    title: 'Multi Signature/Update Mint Distribution/Mint Rate Input',
    component: MintRateInput,
} as Meta;

const Template: Story<MintRateInputProps> = (args) => {
    const [value, setValue] = useState(args.value);
    return <MintRateInput {...args} value={value} onChange={setValue} />;
};

export const Primary = Template.bind({});
Primary.args = {
    value: '7.555665e-10',
    paydaysPerYear: 126144000,
};

export const Disabled = Template.bind({});
Disabled.args = {
    value: '7.555665e-10',
    paydaysPerYear: 126144000,
    disabled: true,
};
