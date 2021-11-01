import React, { useState } from 'react';
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0';
import DatePicker from './DatePicker';
import { PropsOf } from '~/utils/types';

export default {
    title: 'Components/Form/Fields/Date Picker',
    component: DatePicker,
} as Meta;

const Template: Story<PropsOf<typeof DatePicker>> = (args) => {
    const [value, setValue] = useState<Date | undefined>(args.value);

    return (
        <div style={{ width: 300 }}>
            <DatePicker {...args} onChange={setValue} value={value} />
        </div>
    );
};

export const Primary = Template.bind({});
Primary.args = {
    label: 'Date & time',
};
