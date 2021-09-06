// import React, { useCallback, useMemo, useState } from 'react';
import React, { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
// import { Account, RewardFilter, TransactionKindString } from '~/utils/types';
import { Account, TransactionKindString } from '~/utils/types';
import Checkbox from '~/components/Form/Checkbox';
import {
    chosenAccountSelector,
    updateRewardFilter,
} from '~/features/AccountSlice';
import { getActiveBooleanFilters } from '~/utils/accountHelpers';
// import InputTimestamp from '~/components/Form/InputTimestamp';

import styles from './TransactionLogFilters.module.scss';

const transactionFilters: {
    kind: TransactionKindString | TransactionKindString[];
    display: string;
}[] = [
    { kind: TransactionKindString.Transfer, display: 'Simple transfers' },
    {
        kind: TransactionKindString.TransferWithSchedule,
        display: 'Scheduled transfers',
    },
    { kind: TransactionKindString.TransferToEncrypted, display: 'Shieldings' },
    { kind: TransactionKindString.TransferToPublic, display: 'Unshieldings' },
    {
        kind: TransactionKindString.EncryptedAmountTransfer,
        display: 'Shielded transfer fees',
    },
    {
        kind: TransactionKindString.FinalizationReward,
        display: 'Show finalization rewards',
    },
    { kind: TransactionKindString.BakingReward, display: 'Show baker rewards' },
    { kind: TransactionKindString.BlockReward, display: 'Show block rewards' },
    {
        kind: TransactionKindString.UpdateCredentials,
        display: 'Update account credentials',
    },
    {
        kind: [
            TransactionKindString.AddBaker,
            TransactionKindString.RemoveBaker,
            TransactionKindString.UpdateBakerKeys,
            TransactionKindString.UpdateBakerRestakeEarnings,
            TransactionKindString.UpdateBakerStake,
        ],
        display: 'Baker transactions',
    },
];

const isGroup = (
    filter: TransactionKindString | TransactionKindString[]
): filter is TransactionKindString[] => typeof filter !== 'string';

/**
 * Displays available transaction filters, and allows the user to activate/deactive them..
 */
export default function TransactionLogFilters() {
    const dispatch = useDispatch();

    const account = useSelector(chosenAccountSelector);
    const { rewardFilter = {}, address } = account ?? ({} as Account);
    // const { fromDate: storedFromDate, toDate: storedToDate } = rewardFilter;

    // const [fromDate, setFromDate] = useState<Date | undefined>(
    //     storedFromDate ? new Date(storedFromDate) : undefined
    // );
    // const [toDate, setToDate] = useState<Date | undefined>(
    //     storedToDate ? new Date(storedToDate) : undefined
    // );

    const booleanFilters = useMemo(
        () => getActiveBooleanFilters(rewardFilter),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [...Object.values(rewardFilter)]
    );

    const updateFilter = useCallback(
        (filter: TransactionKindString | TransactionKindString[]) => {
            const firstFilter = isGroup(filter) ? filter[0] : filter; // First filter in a group represents the rest.
            const setActive = !booleanFilters.includes(firstFilter);
            const filters = isGroup(filter) ? filter : [filter];

            const newFilter = { ...rewardFilter };
            filters.forEach((f) => {
                newFilter[f] = setActive;
            });

            updateRewardFilter(dispatch, address, newFilter, true);
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [address, dispatch, ...Object.values(rewardFilter)]
    );

    // const updateDate = useCallback(
    //     (
    //         key: keyof Pick<RewardFilter, 'fromDate' | 'toDate'>,
    //         date?: Date
    //     ) => () => {
    //         updateRewardFilter(
    //             dispatch,
    //             address,
    //             { ...rewardFilter, [key]: date?.toString() },
    //             true
    //         );
    //     },
    //     // eslint-disable-next-line react-hooks/exhaustive-deps
    //     [...Object.values(rewardFilter), address, dispatch]
    // );

    if (!account) {
        return null;
    }

    return (
        <section className={styles.root}>
            {/* <InputTimestamp
                className="pT20"
                label="From:"
                value={fromDate}
                onChange={setFromDate}
                onBlur={updateDate('fromDate', fromDate)}
            />
            <InputTimestamp
                className="pT20"
                label="To:"
                value={toDate}
                onChange={setToDate}
                onBlur={updateDate('toDate', toDate)}
            /> */}
            <div className="p40">
                {transactionFilters.map(({ kind, display }) => {
                    const firstFilter = isGroup(kind) ? kind[0] : kind;

                    return (
                        <Checkbox
                            size="large"
                            key={firstFilter}
                            className="textRight mB10"
                            checked={booleanFilters.includes(firstFilter)}
                            onChange={() => updateFilter(kind)}
                        >
                            {display}
                        </Checkbox>
                    );
                })}
            </div>
        </section>
    );
}
