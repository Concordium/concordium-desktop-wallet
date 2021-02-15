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
        <Sidebar {...args} style={{ position: 'relative', height: 'auto' }} />
    </BrowserRouter>
);

const links: SidebarLink[] = [
    {
        route: '/',
        title: 'Home',
        icon: <i />,
    },
    {
        route: '/1',
        title: 'Accounts',
        icon: <i />,
    },
    {
        route: '/2',
        title: 'Identities',
        icon: <i />,
    },
    {
        route: '/3',
        title: 'Address Book',
        icon: <i />,
    },
    {
        route: '/4',
        title: 'Export/Import',
        icon: <i />,
    },
    {
        route: '/5',
        title: 'Multi Signature Transactions',
        icon: <i />,
    },
    {
        route: '/6',
        title: 'Settings',
        icon: <i />,
    },
];

export const Test = Template.bind({});
Test.args = {
    links,
};
