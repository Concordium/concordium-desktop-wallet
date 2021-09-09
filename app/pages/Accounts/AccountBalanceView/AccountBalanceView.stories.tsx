/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Meta, Story } from '@storybook/react/types-6-0';

import { AccountState } from '~/features/AccountSlice';
import { StoreWrapper } from '~/store/store';
import { Account, AccountInfo, AccountStatus } from '~/utils/types';

import AccountBalanceViewComponent from './AccountBalanceView';
import { microGTUPerGTU } from '~/utils/gtu';

export default {
    title: 'Account Page/Account Balance View',
    component: AccountBalanceViewComponent,
} as Meta;

const Template: Story<{ account: Account; accountInfo: AccountInfo }> = ({
    account,
    accountInfo,
}) => {
    const accounts: AccountState = {
        simpleView: true,
        accounts: [account, { ...account, name: 'Another', address: '234' }],
        accountsInfo: { [account.address]: accountInfo, '234': accountInfo },
        chosenAccountAddress: account.address,
        favouriteAccount: account.address,
    };

    return (
        <StoreWrapper
            accounts={accounts}
            transactions={{ viewingShielded: false } as any}
        >
            <div style={{ width: 428 }}>
                <AccountBalanceViewComponent />
            </div>
        </StoreWrapper>
    );
};

const account: Account = {
    address: '123',
    totalDecrypted: '0',
    allDecrypted: true,
    name: 'Personal',
    status: AccountStatus.Confirmed,
} as Account;

const accountInfo: AccountInfo = {
    accountCredentials: [{} as any],
    accountAmount: `${1000n * microGTUPerGTU}`,
    accountReleaseSchedule: {
        total: `${100n * microGTUPerGTU}`,
    },
    accountIndex: 0,
    accountThreshold: 1,
    accountEncryptionKey: '',
    accountEncryptedAmount: {} as any,
} as AccountInfo;

export const SingleSig = Template.bind({});
SingleSig.args = {
    account,
    accountInfo,
};

export const MultiSig = Template.bind({});
MultiSig.args = {
    account,
    accountInfo: {
        ...accountInfo,
        accountCredentials: [{}, {}] as any[],
    },
};

export const Baker = Template.bind({});
Baker.args = {
    account,
    accountInfo: {
        ...accountInfo,
        accountBaker: {
            bakerId: 123,
            stakedAmount: `${400n * microGTUPerGTU}`,
        } as any,
    },
};
