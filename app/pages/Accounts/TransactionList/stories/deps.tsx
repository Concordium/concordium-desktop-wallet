import React, { PropsWithChildren } from 'react';
import { AccountState } from '~/features/AccountSlice';
import { StoreWrapper } from '~/store/store';
import { microCCDPerCCD } from '~/utils/ccd';
import {
    PropsOf,
    Account,
    TransferTransaction,
    TransactionKindString,
    TransactionStatus,
} from '~/utils/types';
import TransactionListElement from '../TransactionListElement';

type ElementProps = PropsOf<typeof TransactionListElement>;
type StoryProps = Pick<ElementProps, 'showDate'> & ElementProps['transaction'];
export const ElementStoryComponent = (p: StoryProps) => <>{p}</>;

export const account: Account = {
    address: '123',
} as Account;

export const transactionBase: TransferTransaction = {
    toAddress: account.address,
    fromAddress: 'Hjku41290updfaæljsDA',
    blockTime: `${Date.now() / 1000}`,
    subtotal: `${Number(100n * microCCDPerCCD)}`,
    cost: `${Number(123n * microCCDPerCCD) / 1000}`,
    blockHash: 'æk13h2æ4ljh1234h',
    status: TransactionStatus.Finalized,
    transactionKind: TransactionKindString.Transfer,
    transactionHash: 'dsæiahfpæi23æklnæ',
};

export const StoryContext = ({ children }: PropsWithChildren<unknown>) => (
    <StoreWrapper
        accounts={
            {
                accounts: [account],
                chosenAccountAddress: account.address,
            } as AccountState
        }
    >
        <div
            style={{
                width: 428,
                padding: '0 19px',
                maxHeight: 400,
                overflow: 'auto',
            }}
        >
            {children}
        </div>
    </StoreWrapper>
);
