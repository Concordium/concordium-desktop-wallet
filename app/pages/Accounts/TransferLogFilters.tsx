import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { Account, TransactionKindString } from '~/utils/types';
import Checkbox from '~/components/Form/Checkbox';
import { updateRewardFilter } from '~/features/AccountSlice';
import Card from '~/cross-app-components/Card';

interface Props {
    account: Account;
}

const transactionFilters = [
    { kind: TransactionKindString.BakingReward, display: 'Show baker rewards' },
    { kind: TransactionKindString.BlockReward, display: 'Show block rewards' },
    {
        kind: TransactionKindString.FinalizationReward,
        display: 'Show finalization rewards',
    },
];

/**
 * Displays available transaction filters, and allows the user to activate/deactive them..
 */
export default function TransferLogFilters({ account }: Props) {
    const dispatch = useDispatch();
    const rewardFilter = JSON.parse(account.rewardFilter);

    const setRewardFilter = useCallback(
        (updatedKind: TransactionKindString) => {
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
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [rewardFilter, account.address]
    );

    return (
        <Card className="relative flexColumn justifyCenter pH50">
            <h3 className="textCenter m0 mB20">Transfer Log Filters</h3>
            {transactionFilters.map(({ kind, display }) => (
                <Checkbox
                    key={kind}
                    className="textRight mB10"
                    checked={!rewardFilter.includes(kind)}
                    onChange={() => setRewardFilter(kind)}
                >
                    {display}
                </Checkbox>
            ))}
        </Card>
    );
}
