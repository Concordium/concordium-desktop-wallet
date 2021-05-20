import React from 'react';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import { Account, TransactionKindString } from '~/utils/types';
import Checkbox from '~/components/Form/Checkbox';
import TransferView from '~/components/Transfers/TransferView';
import routes from '~/constants/routes.json';
import styles from './TransferLogFilters.module.scss';
import { updateRewardFilter } from '~/features/AccountSlice';

interface Props {
    account: Account;
    returnFunction(): void;
}

/**
 * Displays available transaction filters, and allows the user to activate/deactive them..
 */
export default function TransferLogFilters({ account, returnFunction }: Props) {
    const dispatch = useDispatch();
    const rewardFilter = JSON.parse(account.rewardFilter);

    const setRewardFilter = (updatedKind: TransactionKindString) => {
        if (rewardFilter.includes(updatedKind)) {
            const withoutKind = [...rewardFilter];
            withoutKind.splice(withoutKind.indexOf(updatedKind), 1);
            updateRewardFilter(dispatch, account.address, withoutKind);
        } else {
            updateRewardFilter(dispatch, account.address, [
                ...rewardFilter,
                updatedKind,
            ]);
        }
    };

    return (
        <TransferView
            showBack
            backOnClick={returnFunction}
            exitOnClick={() => dispatch(push(routes.ACCOUNTS))}
        >
            <h2>Transfer Log Filters</h2>
            <Checkbox
                className={styles.checkbox}
                checked={
                    !rewardFilter.includes(TransactionKindString.BakingReward)
                }
                onChange={() =>
                    setRewardFilter(TransactionKindString.BakingReward)
                }
            >
                Show baker rewards
            </Checkbox>
            <Checkbox
                className={styles.checkbox}
                checked={
                    !rewardFilter.includes(TransactionKindString.BlockReward)
                }
                onChange={() =>
                    setRewardFilter(TransactionKindString.BlockReward)
                }
            >
                Show block rewards
            </Checkbox>
            <Checkbox
                className={styles.checkbox}
                checked={
                    !rewardFilter.includes(
                        TransactionKindString.FinalizationReward
                    )
                }
                onChange={() =>
                    setRewardFilter(TransactionKindString.FinalizationReward)
                }
            >
                Show finalization rewards
            </Checkbox>
        </TransferView>
    );
}
