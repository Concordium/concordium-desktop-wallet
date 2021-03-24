/* eslint-disable react/display-name */
import React from 'react';
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0';
import { asyncNoOp } from '~/utils/basicHelpers';
import Button from '~/cross-app-components/Button';
import LedgerView, { LedgerViewProps } from './LedgerView';

export default {
    title: 'Components/Ledger/Ledger',
    component: LedgerView,
    argTypes: {
        children: {
            description:
                'Function passing submitHandler and status as arguments',
        },
    },
} as Meta;

const Template: Story<LedgerViewProps> = (args) => (
    <LedgerView {...args}>
        {(status, submit = asyncNoOp) => (
            <Button
                onClick={() => submit(asyncNoOp)}
                disabled={status !== 'CONNECTED'}
            >
                Submit
            </Button>
        )}
    </LedgerView>
);

export const Loading = Template.bind({});
Loading.args = {
    status: 'LOADING',
    statusText: 'Waiting for ledger connection',
};

export const Connected = Template.bind({});
Connected.args = {
    status: 'CONNECTED',
    statusText: 'Ledger connected',
};

export const Error = Template.bind({});
Error.args = {
    status: 'ERROR',
    statusText: 'Some error happended on the ledger. Please try again.',
};
