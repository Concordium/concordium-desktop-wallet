import React, { useState } from 'react';
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0';
import {
    RewardFractionField,
    RewardFractionFieldProps,
} from './RewardFractionField';

export default {
    title: 'Multi Signature/ Reward Fraction Field',
    component: RewardFractionField,
} as Meta;

const Template: Story<RewardFractionFieldProps> = (args) => {
    const [value, setValue] = useState(args.value);
    return (
        <div style={{ width: '300px' }}>
            <RewardFractionField {...args} value={value} onChange={setValue} />
        </div>
    );
};

export const Primary = Template.bind({});
Primary.args = {
    label: 'Finalization Proof',
    value: 25000,
};

export const Invalid = Template.bind({});
Invalid.args = {
    label: 'Finalization Proof',
    isInvalid: true,
    value: 25000,
};

export const Disabled = Template.bind({});
Disabled.args = {
    label: 'Finalization Proof',
    disabled: true,
    value: 25000,
};
