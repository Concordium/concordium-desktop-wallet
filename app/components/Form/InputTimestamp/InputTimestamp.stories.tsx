import React, { useState } from 'react';
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0';

import InputTimeStampComponent, { InputTimeStampProps } from './InputTimestamp';

export default {
    title: 'Components/Form/Fields/Input Time Stamp',
    component: InputTimeStampComponent,
} as Meta;

const Template: Story<InputTimeStampProps> = (args) => {
    const [value, setValue] = useState<Date | undefined>(args.value);

    return (
        <div style={{ width: '500px', margin: '0 auto' }}>
            <div>Input Value: {`${value}`}</div>
            <InputTimeStampComponent
                {...args}
                value={value}
                onChange={setValue}
            />
        </div>
    );
};

export const Primary = Template.bind({});
Primary.args = {
    label: 'Timestamp',
    error: '',
};

export const WithInitialValue = Template.bind({});
WithInitialValue.args = {
    label: 'Timestamp',
    error: '',
    value: new Date(),
};
