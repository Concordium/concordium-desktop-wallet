import React from 'react';
import { Meta, Story } from '@storybook/react/types-6-0';

import {
    Account,
    PropsOf,
    TransactionKindString,
    TransactionStatus,
    TransferTransaction,
} from '~/utils/types';
import TransactionListElement from '../TransactionListElement';
import { StoreWrapper } from '~/store/store';
import { AccountState } from '~/features/AccountSlice';
import { microGTUPerGTU } from '~/utils/gtu';
import { ElementStoryComponent } from './deps';

export default {
    title: 'Account Page/Transaction List/Element',
    component: ElementStoryComponent,
} as Meta;

const account: Account = {
    address: '123',
} as Account;

const Template: Story<PropsOf<typeof ElementStoryComponent>> = ({
    showDate,
    ...transaction
}) => (
    <StoreWrapper
        accounts={
            {
                accounts: [account],
                chosenAccountAddress: account.address,
            } as AccountState
        }
    >
        <div style={{ width: 428 }}>
            <TransactionListElement
                showDate={showDate}
                transaction={transaction}
            />
        </div>
    </StoreWrapper>
);

const transactionBase: TransferTransaction = {
    toAddress: account.address,
    fromAddress: 'Hjku41290updfaæljsDA',
    blockTime: `${Date.now() / 1000}`,
    subtotal: `${Number(100n * microGTUPerGTU)}`,
    cost: `${Number(123n * microGTUPerGTU) / 1000}`,
    blockHash: 'æk13h2æ4ljh1234h',
    status: TransactionStatus.Finalized,
    transactionKind: TransactionKindString.Transfer,
    transactionHash: 'dsæiahfpæi23æklnæ',
};

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
