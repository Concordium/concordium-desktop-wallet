import React from 'react';
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0';

import Button, { ButtonProps } from './Button';
import PlusIcon from '../../../resources/svg/plus.svg';

export default {
    title: 'Cross App Components/Button',
    component: Button,
} as Meta;

const Template: Story<ButtonProps> = (args) => <Button {...args} />;

export const Primary = Template.bind({});
Primary.args = {
    inverted: false,
    children: 'Button',
    disabled: false,
};

export const Inverted = Template.bind({});
Inverted.args = {
    inverted: true,
    children: 'Button',
    disabled: false,
};

export const Negative = Template.bind({});
Negative.args = {
    negative: true,
    children: 'Button',
    disabled: false,
};

export const Tiny = Template.bind({});
Tiny.args = {
    inverted: false,
    children: 'Button',
    disabled: false,
    size: 'tiny',
};

export const Small = Template.bind({});
Small.args = {
    inverted: false,
    children: 'Button',
    disabled: false,
    size: 'small',
};

export const Big = Template.bind({});
Big.args = {
    inverted: false,
    children: 'Button',
    disabled: false,
    size: 'big',
};

export const Huge = Template.bind({});
Huge.args = {
    inverted: false,
    children: 'Button',
    disabled: false,
    size: 'huge',
};

export const HugeWithIcon = Template.bind({});
HugeWithIcon.args = {
    inverted: true,
    children: 'Button',
    disabled: false,
    size: 'huge',
    icon: <PlusIcon height="20" />,
};

export const Clear = Template.bind({});
Clear.args = {
    children: 'Button',
    clear: true,
};
