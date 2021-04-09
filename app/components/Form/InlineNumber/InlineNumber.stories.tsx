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
    const [value, setValue] = useState<number | undefined>(args.value);

    return (
        <div style={{ width: '500px', margin: '0 auto' }}>
            <div>Input Value: {`${value}`}</div>
            <div>
                Specify amount:{' '}
                <InlineNumber {...args} value={value} onChange={setValue} />,
                Please
            </div>
        </div>
    );
};

export const OnlyIntegers = Template.bind({});
OnlyIntegers.args = {};

export const EnsureTwoDigits = Template.bind({});
EnsureTwoDigits.args = {
    allowFractions: true,
    ensureDigits: 2,
    defaultValue: 0,
    step: 0.01,
};

export const Label = Template.bind({});
Label.args = {
    allowFractions: true,
    defaultValue: 0,
    step: 5,
    label: ' Releases',
};

export const PrefixLabel = Template.bind({});
PrefixLabel.args = {
    allowFractions: true,
    ensureDigits: 2,
    defaultValue: 0,
    step: 0.01,
    label: getGTUSymbol(),
    labelPosition: 'prefix',
};

export const Disabled = Template.bind({});
Disabled.args = {
    allowFractions: true,
    ensureDigits: 2,
    defaultValue: 0,
    step: 0.01,
    label: getGTUSymbol(),
    labelPosition: 'prefix',
    disabled: true,
};

export const Invalid = Template.bind({});
Invalid.args = {
    allowFractions: true,
    ensureDigits: 2,
    defaultValue: 0,
    step: 0.01,
    label: getGTUSymbol(),
    labelPosition: 'prefix',
    isInvalid: true,
    value: -100,
};
