import React, { useState } from 'react';
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0';
import Radios, { RadiosProps } from './Radios';

export default {
    title: 'Components/Form/Fields/Radios',
    component: Radios,
} as Meta;

const Template: Story<RadiosProps<number>> = (args) => {
    const [value, setValue] = useState<number | undefined>(args.value);

    return (
        <div style={{ width: 300 }}>
            <Radios {...args} onChange={setValue} value={value} />
        </div>
    );
};

const options: RadiosProps<number>['options'] = [
    { value: 1, label: 'First' },
    { value: 2, label: 'Second' },
    { value: 3, label: 'Third' },
    { value: 4, label: 'Fourth' },
];

export const Primary = Template.bind({});
Primary.args = {
    options,
    value: 1,
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
