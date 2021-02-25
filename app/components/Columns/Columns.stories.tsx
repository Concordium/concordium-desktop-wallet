import React from 'react';
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0';

import Columns, { ColumnsProps } from './Columns';
import { ColumnProps } from './Column';

export default {
    title: 'Components/Columns',
    component: Columns,
    decorators: [
        (story) => (
            <>
                <style>
                    {`
                        .sb-col-inner {
                            height: 100%;
                            background-color: lightgrey;
                            width: 100%;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                        }
                        .sb-col-var-2 {
                            flex-grow: 0;
                            flex-basis: 400px;
                        }
                    `}
                </style>
                {story()}
            </>
        ),
    ],
} as Meta;

const Template: Story<ColumnsProps> = (args) => (
    <div style={{ height: '400px', backgroundColor: 'white' }}>
        <Columns {...args} />
    </div>
);

const col = (props: ColumnProps = {}) => (
    <Columns.Column {...props}>
        <div className="sb-col-inner">Column</div>
    </Columns.Column>
);

export const NoDivider = Template.bind({});
NoDivider.args = {
    // eslint-disable-next-line react/jsx-key
    children: [col(), col()],
};

export const WithDivider = Template.bind({});
WithDivider.args = {
    // eslint-disable-next-line react/jsx-key
    children: [col(), col()],
    divider: true,
};

const scrollCol = (height: number, props: ColumnProps = {}) => (
    <Columns.Column {...props}>
        <div className="sb-col-inner" style={{ height }}>
            Scrollable column
        </div>
    </Columns.Column>
);

export const WithScrollableColumns = Template.bind({});
WithScrollableColumns.args = {
    // eslint-disable-next-line react/jsx-key
    children: [scrollCol(800), scrollCol(450)],
    divider: true,
};

export const VariableSize = Template.bind({});
VariableSize.args = {
    // eslint-disable-next-line react/jsx-key
    children: [col(), scrollCol(450, { className: 'sb-col-var-2' })],
};
