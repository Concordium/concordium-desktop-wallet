import React from 'react';
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0';
import ProposalStatusView, {
    ProposalStatusViewProps,
} from './ProposalStatusView';
import { MultiSignatureTransactionStatus } from '~/utils/types';

export default {
    title: 'Multi Signature/Proposal Status',
    component: ProposalStatusView,
} as Meta;

const Template: Story<ProposalStatusViewProps> = (args) => (
    <div style={{ width: 400 }}>
        <ProposalStatusView {...args} />
    </div>
);

export const Open = Template.bind({});
Open.args = {
    headerLeft: 'Header left',
    headerRight: 'Header right',
    status: MultiSignatureTransactionStatus.Open,
    title: 'Transaction title',
    children: ['Effective time: DD - MM - YYYY'],
};

export const Submitted = Template.bind({});
Submitted.args = {
    headerLeft: 'Header left',
    headerRight: 'Header right',
    submittedOn: new Date(),
    status: MultiSignatureTransactionStatus.Submitted,
    title: 'Transaction title',
    children: ['Effective time: DD - MM - YYYY'],
};

export const Failed = Template.bind({});
Failed.args = {
    headerLeft: 'Header left',
    headerRight: 'Header right',
    submittedOn: new Date(),
    status: MultiSignatureTransactionStatus.Rejected,
    title: 'Transaction title',
    children: ['Effective time: DD - MM - YYYY'],
};

export const Success = Template.bind({});
Success.args = {
    headerLeft: 'Header left',
    headerRight: 'Header right',
    submittedOn: new Date(),
    status: MultiSignatureTransactionStatus.Finalized,
    title: 'Transaction title',
    children: ['Effective time: DD - MM - YYYY'],
};
