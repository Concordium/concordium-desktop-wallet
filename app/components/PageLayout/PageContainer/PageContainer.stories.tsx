import React, { PropsWithChildren } from 'react';
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0';

import clsx from 'clsx';
import PageContainer, { PageContainerProps } from './PageContainer';

export default {
    title: 'Components/Page Layout/Page Container',
    component: PageContainer,
    decorators: [
        (story) => (
            <>
                <style>
                    {`
                        .sb-page-container {
                            height: 800px;
                            min-width: 900px;
                        }
                    `}
                </style>
                {story()}
            </>
        ),
    ],
} as Meta;

const Template: Story<PropsWithChildren<PageContainerProps>> = (args) => (
    <PageContainer
        {...args}
        className={clsx('sb-page-container', args.className)}
    />
);

export const Primary = Template.bind({});
Primary.args = {
    children: <h1>Content</h1>,
};
