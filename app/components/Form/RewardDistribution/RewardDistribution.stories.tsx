import React from 'react';
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0';

import RewardDistributionComponent from './RewardDistribution';

export default {
    title: 'Components/Form/Fields/Reward Distribution',
    component: RewardDistributionComponent,
} as Meta;

const Template: Story = (args) => <RewardDistributionComponent {...args} />;

export const RewardDistribution = Template.bind({});
RewardDistribution.args = {};
