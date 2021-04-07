import React from 'react';
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0';
import LoadingComponent, { LoadingProps } from './Loading';

export default {
    title: 'Cross App Components/Loading',
    component: LoadingComponent,
} as Meta;

const Template: Story<LoadingProps> = (args) => (
    <div style={{ height: '200px', position: 'relative' }}>
        <LoadingComponent {...args} />
    </div>
);

export const NoText = Template.bind({});
NoText.args = {};

export const WithText = Template.bind({});
WithText.args = {
    text: 'Fetching data, please wait.',
};
