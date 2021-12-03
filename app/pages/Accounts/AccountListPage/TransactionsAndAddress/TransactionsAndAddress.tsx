import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useRouteMatch } from 'react-router';
import clsx from 'clsx';
import routes from '~/constants/routes.json';
import TabbedCard from '~/components/TabbedCard';
import { transactionsSelector } from '~/features/TransactionSlice';
import { Account, TransferTransaction } from '~/utils/types';
import ShowAccountAddress from '../../ShowAccountAddress';
import TransactionList from '../../TransactionList';
import TransactionView from '../../TransactionView';

import styles from './TransactionsAndAddress.module.scss';
import TransactionsHeader from '../../TransactionsHeader';

interface Props {
    account: Account;
}

export default function TransfersAndAddress({ account }: Props) {
    const transactions = useSelector(transactionsSelector);
    const addressRouteMatch = useRouteMatch(routes.ACCOUNTS_ADDRESS);
    const [chosenTransaction, setChosenTransaction] = useState<
        TransferTransaction | undefined
    >();

    return (
        <TabbedCard className={styles.root}>
            <TabbedCard.Tab
                header={<TransactionsHeader text="Latest transactions" />}
            >
                {chosenTransaction ? (
                    <TransactionView
                        transaction={chosenTransaction}
                        setTransaction={setChosenTransaction}
                        onClose={() => setChosenTransaction(undefined)}
                    />
                ) : (
                    <div className={styles.fillCardPadding}>
                        <TransactionList
                            transactions={transactions.slice(0, 10)}
                            onTransactionClick={setChosenTransaction}
                        />
                    </div>
                )}
            </TabbedCard.Tab>
            <TabbedCard.Tab
                header="Account address"
                onClick={() => setChosenTransaction(undefined)}
                initActive={Boolean(addressRouteMatch)}
            >
                <ShowAccountAddress
                    className={clsx(
                        styles.thickBlueSeparatorTop,
                        styles.address
                    )}
                    account={account}
                />
            </TabbedCard.Tab>
        </TabbedCard>
    );
}
