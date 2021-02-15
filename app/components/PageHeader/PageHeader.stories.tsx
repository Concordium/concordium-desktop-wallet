/* eslint-disable react/jsx-key */
import React from 'react';
import { Meta, Story } from '@storybook/react/types-6-0';
import PageHeader, { PageHeaderProps } from './PageHeader';
import SvgPlus from '../../assets/svg/plus.svg';

export default {
    title: 'Components/PageHeader',
    component: PageHeader,
} as Meta;

const Template: Story<PageHeaderProps> = (args) => <PageHeader {...args} />;

export const Title = Template.bind({});
Title.args = {
    children: [<h1>Page Title</h1>],
};

export const WithButtons = Template.bind({});
WithButtons.args = {
    children: [
        <h1>Page Title</h1>,
        <PageHeader.Button align="right">
            <SvgPlus />
        </PageHeader.Button>,
        <PageHeader.Button align="right">
            <SvgPlus />
        </PageHeader.Button>,
        <PageHeader.Button align="left">
            <SvgPlus />
        </PageHeader.Button>,
        <PageHeader.Button align="left">
            <SvgPlus />
        </PageHeader.Button>,
    ],
};
