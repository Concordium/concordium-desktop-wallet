import React from 'react';
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0';

import Columns, { ColumnsProps } from './Columns';

export default {
    title: 'Components/Columns',
    component: Columns,
} as Meta;

const Template: Story<ColumnsProps> = (args) => (
    <div style={{ height: '400px', backgroundColor: 'white' }}>
        <Columns {...args} />
    </div>
);

const col = (
    <Columns.Column>
        <div style={{ height: '100%', backgroundColor: 'lightgrey' }}>
            Column
        </div>
    </Columns.Column>
);

export const NoDivider = Template.bind({});
NoDivider.args = {
    // eslint-disable-next-line react/jsx-key
    children: [col, col],
};

export const WithDivider = Template.bind({});
WithDivider.args = {
    // eslint-disable-next-line react/jsx-key
    children: [col, col],
    divider: true,
};

const scrollCol = (height: number) => (
    <Columns.Column>
        <div style={{ height: `${height}px`, backgroundColor: 'lightgrey' }}>
            Scrollable column
        </div>
    </Columns.Column>
);

export const WithScrollableColumns = Template.bind({});
WithScrollableColumns.args = {
    // eslint-disable-next-line react/jsx-key
    children: [scrollCol(800), col],
    divider: true,
};
