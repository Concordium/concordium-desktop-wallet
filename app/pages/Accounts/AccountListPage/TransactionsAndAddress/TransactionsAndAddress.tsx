import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import TabbedCard from '~/components/TabbedCard';
import { transactionsSelector } from '~/features/TransactionSlice';
import { Account, TransferTransaction } from '~/utils/types';
import ShowAccountAddress from '../../ShowAccountAddress';
import TransactionList from '../../TransactionList';
import TransactionView from '../../TransactionView';

interface Props {
    account: Account;
}

export default function TransfersAndAddress({ account }: Props) {
    const transactions = useSelector(transactionsSelector);
    const [chosenTransaction, setChosenTransaction] = useState<
        TransferTransaction | undefined
    >();
    const [activeTab, setActiveTab] = useState<1 | 2 | undefined>(1);

    useEffect(() => {
        if (activeTab !== undefined) {
            setChosenTransaction(undefined);
        }
    }, [activeTab]);

    useEffect(() => {
        if (chosenTransaction !== undefined) {
            setActiveTab(undefined);
        }
    }, [chosenTransaction]);

    return (
        <TabbedCard>
            <TabbedCard.Tab
                header="Latest transactions"
                onClick={() => setActiveTab(1)}
                isActive={activeTab === 1 && chosenTransaction === undefined}
            >
                {chosenTransaction ? (
                    <TransactionView transaction={chosenTransaction} />
                ) : (
                    <TransactionList
                        transactions={transactions.slice(0, 10)}
                        onTransactionClick={setChosenTransaction}
                    />
                )}
            </TabbedCard.Tab>
            <TabbedCard.Tab
                header="Account address"
                onClick={() => setActiveTab(2)}
                isActive={activeTab === 2}
            >
                <ShowAccountAddress account={account} />
            </TabbedCard.Tab>
        </TabbedCard>
    );
}
