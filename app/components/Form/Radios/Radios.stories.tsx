import React, { useState } from 'react';
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0';
import Radios from './Radios';
import { PropsOf } from '~/utils/types';

export default {
    title: 'Components/Form/Fields/Radios',
    component: Radios,
} as Meta;

type Props = PropsOf<typeof Radios>;

const Template: Story<Props> = (args) => {
    const [value, setValue] = useState<string | undefined>(args.value);

    return (
        <div style={{ width: 300 }}>
            <Radios {...args} onChange={setValue} value={value} />
        </div>
    );
};

const options: Props['options'] = [
    { value: 'first', label: 'First' },
    { value: 'second', label: 'Second' },
    { value: 'third', label: 'Third' },
    { value: 'fourth', label: 'Fourth' },
];

export const Primary = Template.bind({});
Primary.args = {
    options,
    defaultValue: options[0].value,
};

export const WithLabel = Template.bind({});
WithLabel.args = {
    options: options.slice(0, 3),
    label: 'Select an option',
};

export const Invalid = Template.bind({});
Invalid.args = {
    options: options.slice(0, 2),
    label: 'Select an option',
    isInvalid: true,
    error: 'An option must be selected',
};
