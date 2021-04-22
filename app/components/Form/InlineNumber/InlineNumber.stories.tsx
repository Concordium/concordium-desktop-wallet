import React, { useState } from 'react';
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0';
import InlineNumber, { InlineNumberProps } from './InlineNumber';
import { getGTUSymbol } from '~/utils/gtu';

export default {
    title: 'Components/Form/Fields/Inline Number',
    component: InlineNumber,
} as Meta;

const Template: Story<InlineNumberProps> = (args) => {
    const [value, setValue] = useState<string | undefined>(args.value);

    return (
        <div style={{ width: '500px', margin: '0 auto' }}>
            <div>Input Value: {`${value}`}</div>
            <InlineNumber {...args} value={value} onChange={setValue} />
        </div>
    );
};

export const OnlyIntegers = Template.bind({});
OnlyIntegers.args = {};

export const EnsureTwoDigits = Template.bind({});
EnsureTwoDigits.args = {
    allowFractions: true,
    ensureDigits: 2,
    fallbackValue: 0,
    step: 0.01,
};

const LabelTemplate: Story<InlineNumberProps> = (args) => {
    const [value, setValue] = useState<string | undefined>(args.value);

    return (
        <div style={{ width: '500px', margin: '0 auto' }}>
            <div>Input Value: {`${value}`}</div>
            <label>
                Specify amount: {getGTUSymbol()}
                <InlineNumber {...args} value={value} onChange={setValue} />
            </label>
        </div>
    );
};

export const Labelled = LabelTemplate.bind({});
Labelled.args = {
    allowFractions: true,
    fallbackValue: 0,
    step: 0.01,
};

export const Disabled = LabelTemplate.bind({});
Disabled.args = {
    allowFractions: true,
    ensureDigits: 2,
    fallbackValue: 0,
    step: 0.01,
    disabled: true,
};

export const Invalid = LabelTemplate.bind({});
Invalid.args = {
    allowFractions: true,
    ensureDigits: 2,
    fallbackValue: 0,
    step: 0.01,
    isInvalid: true,
    value: '-100',
};
