import React from 'react';
import { Meta, Story } from '@storybook/react/types-6-0';

import { PropsOf } from '~/utils/types';
import TransactionListElement from '../TransactionListElement';
import {
    account,
    ElementStoryComponent,
    StoryContext,
    transactionBase,
} from './deps';

export default {
    title: 'Account Page/Transaction List/Element',
    component: ElementStoryComponent,
} as Meta;

const Template: Story<PropsOf<typeof ElementStoryComponent>> = ({
    showDate,
    ...transaction
}) => (
    <StoryContext>
        <TransactionListElement showDate={showDate} transaction={transaction} />
    </StoryContext>
);

export const SimpleTransferIn = Template.bind({});
SimpleTransferIn.args = {
    ...transactionBase,
};

export const SimpleTransferOut = Template.bind({});
SimpleTransferOut.args = {
    ...transactionBase,
    fromAddress: account.address,
    toAddress: 'Hjku41290updfaæljsDA',
};
