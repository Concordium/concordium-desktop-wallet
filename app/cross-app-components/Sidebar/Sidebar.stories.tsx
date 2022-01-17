/* eslint-disable import/prefer-default-export */
import React from 'react';
import { Meta, Story } from '@storybook/react/types-6-0';
import { BrowserRouter } from 'react-router-dom';

import Sidebar, { SidebarLink, SidebarProps } from './Sidebar';
import MainLayout from '../MainLayout';

export default {
    title: 'Cross App Components/Sidebar',
    component: Sidebar,
    decorators: [
        (StoryComponent) => {
            return (
                <BrowserRouter>
                    {StoryComponent()}
                    <MainLayout>
                        <h1
                            style={{
                                textAlign: 'center',
                                margin: 0,
                                paddingTop: '1em',
                            }}
                        >
                            Page content
                        </h1>
                    </MainLayout>
                </BrowserRouter>
            );
        },
    ],
} as Meta;

const Template: Story<SidebarProps> = (args) => (
    <Sidebar {...args} version="1.0.0" style={{ position: 'absolute' }} />
);

const links: SidebarLink[] = [
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
        title: 'Address book',
        icon: <i />,
    },
    {
        route: '/4',
        title: 'Export/Import',
        icon: <i />,
    },
    {
        route: '/5',
        title: 'Multi signature transactions',
        icon: <i />,
    },
    {
        route: '/6',
        title: 'Settings',
        icon: <i />,
    },
];

export const Light = Template.bind({});
Light.args = {
    links,
};

export const Dark = Template.bind({});
Dark.args = {
    links,
};
Dark.parameters = {
    backgrounds: {
        default: 'dark',
    },
};
