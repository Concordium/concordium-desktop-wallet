/* eslint-disable react/jsx-key */
import React, { PropsWithChildren } from 'react';
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0';

import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { BrowserRouter } from 'react-router-dom';
import PageLayout from './PageLayout';
import PlusIcon from '../../../resources/svg/plus.svg';

export default {
    title: 'Components/Page Layout',
    component: PageLayout,
    subcomponents: {
        'PageLayout.Header': PageLayout.Header,
        'PageLayout.HeaderButton': PageLayout.HeaderButton,
        'PageLayout.Container': PageLayout.Container,
    },
    decorators: [
        (story) => (
            <>
                <style>
                    {`
                        .sb-hack-wrapper > article {
                            height: 800px;
                        }
                        .sb-hack-wrapper > article > section {
                            min-width: 100%;
                        }
                    `}
                </style>
                <span className="sb-hack-wrapper">{story()}</span>
            </>
        ),
    ],
} as Meta;

const Template: Story<PropsWithChildren<unknown>> = (args) => (
    <BrowserRouter>
        <Provider store={createStore(() => null)}>
            <PageLayout {...args} />
        </Provider>
    </BrowserRouter>
);

export const Primary = Template.bind({});
Primary.args = {
    children: [
        <PageLayout.Header>
            <h1>Header</h1>
        </PageLayout.Header>,
        <h3>Content</h3>,
    ],
};

export const WithHeaderButtons = Template.bind({});
WithHeaderButtons.args = {
    children: [
        <PageLayout.Header>
            <PageLayout.HeaderButton align="left">
                <PlusIcon height="20" />
            </PageLayout.HeaderButton>
            <h1>Page title</h1>
            <PageLayout.HeaderButton align="right">
                <PlusIcon height="20" />
            </PageLayout.HeaderButton>
        </PageLayout.Header>,
        <h3>Content</h3>,
    ],
};

export const WithContainer = Template.bind({});
WithContainer.args = {
    children: [
        <PageLayout.Header>
            <h1>Header</h1>
        </PageLayout.Header>,
        <PageLayout.Container closeRoute="/">
            <h3>Content</h3>
        </PageLayout.Container>,
    ],
};
