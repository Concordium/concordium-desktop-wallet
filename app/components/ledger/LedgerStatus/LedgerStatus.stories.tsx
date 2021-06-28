import React from 'react';
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0';
import LedgerStatus, { LedgerStatusProps } from './LedgerStatus';
import { LedgerStatusType } from '../util';

export default {
    title: 'Components/Ledger/Ledger Status',
    component: LedgerStatus,
} as Meta;

const Template: Story<LedgerStatusProps> = (args) => <LedgerStatus {...args} />;

export const Loading = Template.bind({});
Loading.args = {
    status: LedgerStatusType.DISCONNECTED,
    statusText: 'Waiting for ledger connection',
};

export const Connected = Template.bind({});
Connected.args = {
    status: LedgerStatusType.CONNECTED,
    statusText: 'Ledger connected',
};

export const Error = Template.bind({});
Error.args = {
    status: LedgerStatusType.ERROR,
    statusText: 'Some error happended on the ledger. Please try again.',
};
