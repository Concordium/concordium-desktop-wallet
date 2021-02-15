/* eslint-disable react/jsx-key */
import React from 'react';
import { Meta, Story } from '@storybook/react/types-6-0';
import PageHeader, { PageHeaderProps } from './PageHeader';
import PageHeaderButton from './PageHeaderButton';
import SvgPlus from '../../assets/svg/plus.svg';

export default {
    title: 'Components/PageHeader',
    component: PageHeader,
    subcomponents: {
        'PageHeader.Button': PageHeaderButton,
    },
} as Meta;

const Template: Story<PageHeaderProps> = (args) => <PageHeader {...args} />;

export const WithButtons = Template.bind({});
WithButtons.args = {
    children: [
        <PageHeader.Button align="left">
            <SvgPlus />
        </PageHeader.Button>,
        <PageHeader.Button align="left">
            <SvgPlus />
        </PageHeader.Button>,
        <h1>Page Title</h1>,
        <PageHeader.Button align="right">
            <SvgPlus />
        </PageHeader.Button>,
        <PageHeader.Button align="right">
            <SvgPlus />
        </PageHeader.Button>,
    ],
};

export const NoButtons = Template.bind({});
NoButtons.args = {
    children: [<h1>Page Title</h1>],
};
