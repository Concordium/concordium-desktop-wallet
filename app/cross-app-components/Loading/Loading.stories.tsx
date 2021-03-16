import React from 'react';
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0';
import LoadingComponent from './Loading';

export default {
    title: 'Cross App Components/Loading',
    component: LoadingComponent,
} as Meta;

const Template: Story = () => (
    <div style={{ height: '100px', position: 'relative' }}>
        <LoadingComponent />
    </div>
);

export const Loading = Template.bind({});
Loading.args = {};
