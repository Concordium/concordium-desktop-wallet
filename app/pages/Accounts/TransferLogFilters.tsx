import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { Account, TransactionKindString } from '~/utils/types';
import Checkbox from '~/components/Form/Checkbox';
import { updateRewardFilter } from '~/features/AccountSlice';
import Card from '~/cross-app-components/Card';
import { getBooleanFilters } from '~/utils/accountHelpers';

interface Props {
    account: Account;
}

const transactionFilters: { kind: TransactionKindString; display: string }[] = [
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
    const { rewardFilter, address } = account;
    const booleanFilters = getBooleanFilters(rewardFilter, true);

    const updateFilter = useCallback(
        (f: TransactionKindString) => {
            const newFilter = { ...rewardFilter };
            if (booleanFilters.includes(f)) {
                newFilter[f] = false;
            } else {
                newFilter[f] = true;
            }

            updateRewardFilter(dispatch, address, newFilter, true);
        },
        [booleanFilters, address, dispatch, rewardFilter]
    );

    return (
        <Card className="relative flexColumn justifyCenter pH50">
            <h3 className="textCenter m0 mB20">Transfer Log Filters</h3>
            {transactionFilters.map(({ kind, display }) => (
                <Checkbox
                    key={kind}
                    className="textRight mB10"
                    checked={!booleanFilters.includes(kind)}
                    onChange={() => updateFilter(kind)}
                >
                    {display}
                </Checkbox>
            ))}
        </Card>
    );
}
