import React, { useState } from 'react';
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0';

import RewardDistributionComponent, {
    RewardDistributionProps,
    RewardDistributionValue,
} from './RewardDistribution';

export default {
    title: 'Components/Form/Fields/Reward Distribution',
    component: RewardDistributionComponent,
} as Meta;

const Template: Story<RewardDistributionProps> = (args) => {
    const [value, setValue] = useState<RewardDistributionValue | undefined>(
        args.value
    );
    return (
        <div style={{ width: 350, margin: '0 auto' }}>
            Value: {JSON.stringify(value)}
            <br />
            <RewardDistributionComponent
                {...args}
                value={value}
                onChange={setValue}
            />
        </div>
    );
};

export const RewardDistribution = Template.bind({});
RewardDistribution.args = {
    labels: [
        'Baking reward account',
        'Finalization reward account',
        'Foundation',
    ],
    value: {
        first: 61234 / 100000,
        second: 30000 / 100000,
    },
};
