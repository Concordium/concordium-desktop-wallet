import React from 'react';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import { Account, RewardFilter } from '~/utils/types';
import Checkbox from '~/components/Form/Checkbox';
import TransferView from '~/components/Transfers/TransferView';
import routes from '../../constants/routes.json';
import styles from './TransferLogFilters.module.scss';
import { updateRewardFilter } from '~/features/AccountSlice';

interface Props {
    account: Account;
    returnFunction(): void;
}

/**
 * Displays the account's address, and allows the user to copy it.
 */
export default function TransferLogFilters({ account, returnFunction }: Props) {
    const dispatch = useDispatch();

    const setRewardFilter = (filterStatus: RewardFilter) =>
        updateRewardFilter(dispatch, account.address, filterStatus);

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
                    account.rewardFilter !== undefined &&
                    [
                        RewardFilter.All,
                        RewardFilter.AllButFinalization,
                    ].includes(account.rewardFilter)
                }
                onChange={() =>
                    account.rewardFilter === RewardFilter.None
                        ? setRewardFilter(RewardFilter.AllButFinalization)
                        : setRewardFilter(RewardFilter.None)
                }
            >
                Show baker rewards
            </Checkbox>
            <Checkbox
                className={styles.checkbox}
                checked={account.rewardFilter === RewardFilter.All}
                onChange={() =>
                    account.rewardFilter === RewardFilter.All
                        ? setRewardFilter(RewardFilter.AllButFinalization)
                        : setRewardFilter(RewardFilter.All)
                }
            >
                Show finalization rewards
            </Checkbox>
        </TransferView>
    );
}
