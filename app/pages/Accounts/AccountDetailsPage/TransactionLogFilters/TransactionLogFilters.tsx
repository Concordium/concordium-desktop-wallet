import React, { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FormProvider, useForm } from 'react-hook-form';
import {
    Account,
    EqualRecord,
    NotOptional,
    RewardFilter,
    TransactionKindString,
} from '~/utils/types';
import {
    chosenAccountSelector,
    clearRewardFilters,
    updateRewardFilter,
} from '~/features/AccountSlice';
import { getActiveBooleanFilters } from '~/utils/accountHelpers';

import Form from '~/components/Form';

import styles from './TransactionLogFilters.module.scss';
import Button from '~/cross-app-components/Button';

interface FilterForm
    extends Pick<
        RewardFilter,
        | 'toDate'
        | 'fromDate'
        | TransactionKindString.Transfer
        | TransactionKindString.TransferWithSchedule
        | TransactionKindString.TransferToEncrypted
        | TransactionKindString.TransferToPublic
        | TransactionKindString.EncryptedAmountTransfer
        | TransactionKindString.FinalizationReward
        | TransactionKindString.BakingReward
        | TransactionKindString.BlockReward
        | TransactionKindString.UpdateCredentials
    > {
    bakerTransactions?: boolean;
}

const fieldNames: NotOptional<EqualRecord<FilterForm>> = {
    toDate: 'toDate',
    fromDate: 'fromDate',
    [TransactionKindString.Transfer]: TransactionKindString.Transfer,
    [TransactionKindString.TransferWithSchedule]:
        TransactionKindString.TransferWithSchedule,
    [TransactionKindString.TransferToEncrypted]:
        TransactionKindString.TransferToEncrypted,
    [TransactionKindString.TransferToPublic]:
        TransactionKindString.TransferToPublic,
    [TransactionKindString.EncryptedAmountTransfer]:
        TransactionKindString.EncryptedAmountTransfer,
    [TransactionKindString.FinalizationReward]:
        TransactionKindString.FinalizationReward,
    [TransactionKindString.BakingReward]: TransactionKindString.BakingReward,
    [TransactionKindString.BlockReward]: TransactionKindString.BlockReward,
    [TransactionKindString.UpdateCredentials]:
        TransactionKindString.UpdateCredentials,
    bakerTransactions: 'bakerTransactions',
};

const transactionFilters: {
    field: keyof FilterForm;
    filter: TransactionKindString | TransactionKindString[];
    display: string;
}[] = [
    {
        field: TransactionKindString.Transfer,
        filter: TransactionKindString.Transfer,
        display: 'Simple transfers',
    },
    {
        field: TransactionKindString.TransferWithSchedule,
        filter: TransactionKindString.TransferWithSchedule,
        display: 'Scheduled transfers',
    },
    {
        field: TransactionKindString.TransferToEncrypted,
        filter: TransactionKindString.TransferToEncrypted,
        display: 'Shieldings',
    },
    {
        field: TransactionKindString.TransferToEncrypted,
        filter: TransactionKindString.TransferToPublic,
        display: 'Unshieldings',
    },
    {
        field: TransactionKindString.EncryptedAmountTransfer,
        filter: TransactionKindString.EncryptedAmountTransfer,
        display: 'Shielded transfer fees',
    },
    {
        field: TransactionKindString.FinalizationReward,
        filter: TransactionKindString.FinalizationReward,
        display: 'Show finalization rewards',
    },
    {
        field: TransactionKindString.TransferToEncrypted,
        filter: TransactionKindString.BakingReward,
        display: 'Show baker rewards',
    },
    {
        field: TransactionKindString.TransferToEncrypted,
        filter: TransactionKindString.BlockReward,
        display: 'Show block rewards',
    },
    {
        field: TransactionKindString.UpdateCredentials,
        filter: TransactionKindString.UpdateCredentials,
        display: 'Update account credentials',
    },
    {
        field: 'bakerTransactions',
        filter: [
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
    const { fromDate: storedFromDate, toDate: storedToDate } = rewardFilter;
    const form = useForm<FilterForm>();

    const booleanFilters = useMemo(
        () => getActiveBooleanFilters(rewardFilter),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [...Object.values(rewardFilter)]
    );

    const submit = useCallback(
        (store: boolean) => (fields: FilterForm) => {
            const newFilter = Object.entries(fields).reduce((acc, [k, v]) => {
                if (
                    ([
                        fieldNames.fromDate,
                        fieldNames.toDate,
                    ] as string[]).includes(k)
                ) {
                    return { ...acc, [k]: v.toString() };
                }

                const transactionFilter = transactionFilters.find(
                    (t) => t.field === k
                )?.filter;

                if (!transactionFilter || !isGroup(transactionFilter)) {
                    return { ...acc, [k]: v };
                }

                const group = transactionFilter.reduce(
                    (a, f) => ({
                        ...a,
                        [f]: v,
                    }),
                    {} as Partial<RewardFilter>
                );

                return { ...acc, ...group };
            }, rewardFilter);

            updateRewardFilter(dispatch, address, newFilter, store);
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [...Object.values(rewardFilter), dispatch, address]
    );

    if (!account) {
        return null;
    }

    return (
        <FormProvider {...form}>
            <section className={styles.root}>
                <Form.Timestamp
                    name={fieldNames.toDate}
                    className="mT20"
                    label="From:"
                    defaultValue={
                        storedFromDate ? new Date(storedFromDate) : undefined
                    }
                />
                <Form.Timestamp
                    name={fieldNames.toDate}
                    className="mT20"
                    label="To:"
                    defaultValue={
                        storedToDate ? new Date(storedToDate) : undefined
                    }
                />
                <div className="m40 mB10 flexColumn">
                    {transactionFilters.map(({ field, filter, display }) => {
                        const firstFilter = isGroup(filter)
                            ? filter[0]
                            : filter;
                        return (
                            <Form.Checkbox
                                name={field}
                                size="large"
                                key={field}
                                className="textRight mB10"
                                defaultChecked={booleanFilters.includes(
                                    firstFilter
                                )}
                            >
                                {display}
                            </Form.Checkbox>
                        );
                    })}
                    <Button
                        className="mT20"
                        onClick={() => clearRewardFilters(dispatch, address)}
                    >
                        Clear filters
                    </Button>
                    <Button
                        className="mT10"
                        onClick={form.handleSubmit(submit(false))}
                    >
                        Apply momentarily
                    </Button>
                    <Button
                        className="mT10"
                        onClick={form.handleSubmit(submit(true))}
                    >
                        Apply and save
                    </Button>
                </div>
            </section>
        </FormProvider>
    );
}
