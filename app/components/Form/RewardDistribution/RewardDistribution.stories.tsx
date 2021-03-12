import React, { useState } from 'react';
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0';

import RewardDistributionComponent, {
    RewardDistributionValue,
} from './RewardDistribution';

export default {
    title: 'Components/Form/Fields/Reward Distribution',
    component: RewardDistributionComponent,
} as Meta;

const Template: Story = (args) => {
    const [value, setValue] = useState<RewardDistributionValue>({
        first: 60,
        second: 30,
    });
    return (
        <RewardDistributionComponent
            {...args}
            value={value}
            onChange={setValue}
            labels={[
                'Baking reward account',
                'Finalization reward account',
                'Foundation',
            ]}
        />
    );
};

export const RewardDistribution = Template.bind({});
RewardDistribution.args = {};
