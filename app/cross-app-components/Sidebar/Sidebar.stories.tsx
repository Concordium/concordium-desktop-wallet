/* eslint-disable import/prefer-default-export */
import React from 'react';
import { Meta, Story } from '@storybook/react/types-6-0';
import { BrowserRouter } from 'react-router-dom';

import Sidebar, { SidebarLink, SidebarProps } from './Sidebar';
import MainLayout from '../MainLayout';

enum Backgrounds {
    LIGHT = '#fbfbf9',
    DARK = '#000',
}

export default {
    title: 'Cross App Components/Sidebar',
    component: Sidebar,
    parameters: {
        backgrounds: {
            default: 'light',
            values: [
                {
                    name: 'light',
                    value: Backgrounds.LIGHT,
                },
                {
                    name: 'dark',
                    value: Backgrounds.DARK,
                },
            ],
        },
    },
    decorators: [
        (StoryComponent, { globals }) => {
            const isDarkBg = globals?.backgrounds?.value === Backgrounds.DARK;

            return (
                <div className={isDarkBg ? 'theme-dark' : 'theme-light'}>
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
                </div>
            );
        },
    ],
} as Meta;

const Template: Story<SidebarProps> = (args) => (
    <Sidebar {...args} style={{ position: 'absolute' }} />
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

export const Light = Template.bind({});
Light.args = {
    links,
};
