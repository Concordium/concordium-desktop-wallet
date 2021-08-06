import React from 'react';
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0';
import ElectionDifficultyInput, {
    ElectionDifficultyInputProps,
} from './ElectionDifficultyInput';
import Form from '~/components/Form';
import { noOp } from '~/utils/basicHelpers';

export default {
    title:
        'Multi Signature/Update Election Difficulty/Election Difficulty Input',
    component: ElectionDifficultyInput,
} as Meta;

const Template: Story<ElectionDifficultyInputProps> = (args) => {
    return (
        <div style={{ width: 300 }}>
            <Form onSubmit={noOp}>
                <ElectionDifficultyInput {...args} />
            </Form>
        </div>
    );
};

export const Primary = Template.bind({});
Primary.args = {
    label: 'Election Difficulty',
    timePerSlot: 250n,
    value: 0.025,
};
