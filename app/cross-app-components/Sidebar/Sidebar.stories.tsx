/* eslint-disable import/prefer-default-export */
import { Meta, Story } from '@storybook/react/types-6-0';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';

import Sidebar, { SidebarLink, SidebarProps } from './Sidebar';

export default {
    title: 'Example/Sidebar',
    component: Sidebar,
} as Meta;

const Template: Story<SidebarProps> = (args) => (
    <BrowserRouter>
        <Sidebar {...args} />
    </BrowserRouter>
);

const links: SidebarLink[] = [
    {
        route: '',
        title: 'Home',
        icon: <i />,
    },
    {
        route: '',
        title: 'Accounts',
        icon: <i />,
    },
    {
        route: '',
        title: 'Identities',
        icon: <i />,
    },
    {
        route: '',
        title: 'Address Book',
        icon: <i />,
    },
    {
        route: '',
        title: 'Export/Import',
        icon: <i />,
    },
    {
        route: '',
        title: 'Multi Signature Transactions',
        icon: <i />,
    },
    {
        route: '',
        title: 'Settings',
        icon: <i />,
    },
];

export const Test = Template.bind({});
Test.args = {
    links,
};
