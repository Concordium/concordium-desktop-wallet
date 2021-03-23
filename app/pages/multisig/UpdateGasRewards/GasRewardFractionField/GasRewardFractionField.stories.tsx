import React, { useState } from 'react';
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0';
import {
    GasRewardFractionField,
    GasRewardFractionFieldProps,
} from './GasRewardFractionField';

export default {
    title:
        'Multi Signature Page/Update Gas Rewards Page/GAS Reward Fraction Field',
    component: GasRewardFractionField,
} as Meta;

const Template: Story<GasRewardFractionFieldProps> = (args) => {
    const [value, setValue] = useState(args.value);
    return (
        <div style={{ width: '300px' }}>
            <GasRewardFractionField
                {...args}
                value={value}
                onChange={setValue}
            />
        </div>
    );
};

export const Primary = Template.bind({});
Primary.args = {
    label: 'New euro pr. energy rate',
    value: 25000,
};

export const Invalid = Template.bind({});
Invalid.args = {
    label: 'New euro pr. energy rate',
    isInvalid: true,
    value: 25000,
};

export const ReadOnly = Template.bind({});
ReadOnly.args = {
    label: 'New euro pr. energy rate',
    readOnly: true,
    value: 25000,
};

export const Disabled = Template.bind({});
Disabled.args = {
    label: 'New euro pr. energy rate',
    disabled: true,
    value: 25000,
};
