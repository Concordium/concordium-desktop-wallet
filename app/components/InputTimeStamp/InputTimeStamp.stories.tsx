import React, { useState } from 'react';
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0';

import InputTimeStampComponent, { InputTimeStampProps } from './InputTimeStamp';

export default {
    title: 'Components/Input Time Stamp',
    component: InputTimeStampComponent,
} as Meta;

const Template: Story<InputTimeStampProps> = (args) => {
    const [value, setValue] = useState<Date>();

    return (
        <InputTimeStampComponent {...args} value={value} onChange={setValue} />
    );
};

export const InputTimeStamp = Template.bind({});
InputTimeStamp.args = {};
