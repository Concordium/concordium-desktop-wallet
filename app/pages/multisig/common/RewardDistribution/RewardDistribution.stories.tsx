import React, { useState } from 'react';
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0';

import {
    RewardDistributionProps,
    RewardDistributionValue,
    FormRewardDistribution,
    RewardDistribution,
} from './RewardDistribution';
import Form from '~/components/Form';
import { noOp } from '~/utils/basicHelpers';
import { PropsOf } from '~/utils/types';

export default {
    title: 'Multi Signature/Common/Reward Distribution',
    component: FormRewardDistribution,
} as Meta;

const Template: Story<RewardDistributionProps> = (args) => {
    const [value, setValue] = useState<RewardDistributionValue | undefined>(
        args.value
    );
    return (
        <div style={{ width: 350, margin: '0 auto' }}>
            Value: {JSON.stringify(value)}
            <br />
            <RewardDistribution {...args} value={value} onChange={setValue} />
        </div>
    );
};

export const Primary = Template.bind({});
Primary.args = {
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

const ValidationTemplate: Story<PropsOf<typeof FormRewardDistribution>> = (
    args
) => {
    return (
        <div style={{ width: 350, margin: '0 auto' }}>
            <Form onSubmit={noOp}>
                <FormRewardDistribution {...args} />
            </Form>
        </div>
    );
};

const validateRewardDistributionFirstMin = (min: number, message?: string) => (
    value: RewardDistributionValue
) => (value?.first || 0) >= min || message;

export const WithValidation = ValidationTemplate.bind({});
WithValidation.args = {
    name: 'rewardDistribution',
    defaultValue: {
        first: 61234 / 100000,
        second: 30000 / 100000,
    },
    labels: [
        'Baking reward account',
        'Finalization reward account',
        'Foundation',
    ],
    rules: {
        validate: validateRewardDistributionFirstMin(
            0.5,
            'Baking reward account must be > 50%'
        ),
    },
};
