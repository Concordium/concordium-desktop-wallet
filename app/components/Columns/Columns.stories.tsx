import React from 'react';
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0';

import clsx from 'clsx';
import Columns, { ColumnsProps } from './Columns';
import { ColumnProps } from './Column';

export default {
    title: 'Components/Columns',
    component: Columns,
    subcomponents: {
        'Columns.Column': Columns.Column,
    },
    decorators: [
        (story) => (
            <>
                <style>
                    {`
                        .sb-col-inner {
                            height: 200px;
                            width: 100%;
                            background-color: lightgrey;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                        }

                        .sb-columns {
                            height: 400px !important;
                        }
                    `}
                </style>
                {story()}
            </>
        ),
    ],
} as Meta;

const Template: Story<ColumnsProps> = (args) => (
    <Columns {...args} className={clsx('sb-columns', args.className)} />
);

const col = (props: ColumnProps = {}) => (
    <Columns.Column {...props}>
        <div className="sb-col-inner">Column</div>
    </Columns.Column>
);

export const WithHeaders = Template.bind({});
WithHeaders.args = {
    // eslint-disable-next-line react/jsx-key
    children: [col({ header: 'col1' }), col({ header: 'col2' })],
};

export const WithDivider = Template.bind({});
WithDivider.args = {
    // eslint-disable-next-line react/jsx-key
    children: [col(), col()],
    divider: true,
};

export const ThreeColumns = Template.bind({});
ThreeColumns.args = {
    // eslint-disable-next-line react/jsx-key
    children: [
        col({ header: 'col1' }),
        col({ header: 'col2' }),
        col({ header: 'col3' }),
    ],
    divider: true,
};

const scrollCol = (height: number, width?: number, props: ColumnProps = {}) => (
    <Columns.Column {...props}>
        <div className="sb-col-inner" style={{ height, width }}>
            Scrollable column
        </div>
    </Columns.Column>
);

export const WithScrollableColumns = Template.bind({});
WithScrollableColumns.args = {
    // eslint-disable-next-line react/jsx-key
    children: [scrollCol(800), scrollCol(450)],
    divider: true,
    columnScroll: true,
};

export const VariableSize = Template.bind({});
VariableSize.args = {
    // eslint-disable-next-line react/jsx-key
    children: [col(), scrollCol(450, 300, { noResize: true })],
    divider: true,
    columnScroll: true,
    variableSize: true,
};

export const ThreeColumnsVariableSize = Template.bind({});
ThreeColumnsVariableSize.args = {
    // eslint-disable-next-line react/jsx-key
    children: [
        col({ header: 'col1' }),
        scrollCol(450, 300, { noResize: true, header: 'col2' }),
        col({ header: 'col3' }),
    ],
    divider: true,
    columnScroll: true,
    variableSize: true,
};
