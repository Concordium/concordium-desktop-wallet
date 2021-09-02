import React from 'react';
import { Meta, Story } from '@storybook/react/types-6-0';
import TransactionListGroup from '../TransactionListGroup';
import { PropsOf } from '~/utils/types';
import { StoryContext, transactionBase } from './deps';

export default {
    title: 'Account Page/Transaction List/Group',
    component: TransactionListGroup,
} as Meta;

const Template: Story<PropsOf<typeof TransactionListGroup>> = (args) => (
    <StoryContext>
        <TransactionListGroup {...args} />
    </StoryContext>
);

export const SingleGroup = Template.bind({});
SingleGroup.args = {
    header: 'Today',
    transactions: [
        { ...transactionBase },
        { ...transactionBase },
        { ...transactionBase },
        { ...transactionBase },
    ],
};

const MultiGroupTemplate: Story<PropsOf<typeof TransactionListGroup>> = (
    args
) => (
    <StoryContext>
        <TransactionListGroup {...args} />
        <TransactionListGroup {...args} header="Yesterday" />
        <TransactionListGroup {...args} header="7 June" />
        <TransactionListGroup {...args} header="19 may" />
    </StoryContext>
);

export const MultipleGroups = MultiGroupTemplate.bind({});
MultipleGroups.args = {
    header: 'Today',
    transactions: [
        { ...transactionBase },
        { ...transactionBase },
        { ...transactionBase },
        { ...transactionBase },
    ],
};
