import React, { useCallback, useEffect, useMemo, useRef } from 'react';
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
import {
    allowOptional,
    minDate,
    pastDate,
} from '~/components/Form/util/validation';
import { InputTimestampRef } from '~/components/Form/InputTimestamp/util';

interface FilterForm
    extends Pick<
        RewardFilter,
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
    toDate?: Date;
    fromDate?: Date;
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
    group?: TransactionKindString[];
    display: string;
}[] = [
    {
        field: TransactionKindString.Transfer,
        display: 'Simple transfers',
    },
    {
        field: TransactionKindString.TransferWithSchedule,
        display: 'Scheduled transfers',
    },
    {
        field: TransactionKindString.TransferToEncrypted,
        display: 'Shieldings',
    },
    {
        field: TransactionKindString.TransferToPublic,
        display: 'Unshieldings',
    },
    {
        field: TransactionKindString.EncryptedAmountTransfer,
        display: 'Shielded transfer fees',
    },
    {
        field: TransactionKindString.FinalizationReward,
        display: 'Show finalization rewards',
    },
    {
        field: TransactionKindString.BakingReward,
        display: 'Show baker rewards',
    },
    {
        field: TransactionKindString.BlockReward,
        display: 'Show block rewards',
    },
    {
        field: TransactionKindString.UpdateCredentials,
        display: 'Update account credentials',
    },
    {
        field: 'bakerTransactions',
        group: [
            TransactionKindString.AddBaker,
            TransactionKindString.RemoveBaker,
            TransactionKindString.UpdateBakerKeys,
            TransactionKindString.UpdateBakerRestakeEarnings,
            TransactionKindString.UpdateBakerStake,
        ],
        display: 'Baker transactions',
    },
];

const isDateField = (field: keyof FilterForm) =>
    ([fieldNames.toDate, fieldNames.fromDate] as string[]).includes(field);

const getGroupValues = (group: TransactionKindString[], v: boolean) =>
    group.reduce(
        (a, f) => ({
            ...a,
            [f]: v as boolean,
        }),
        {} as Partial<RewardFilter>
    );

const pastDateValidator = allowOptional(pastDate('Date must be before today'));

/**
 * Displays available transaction filters, and allows the user to activate/deactive them..
 */
export default function TransactionLogFilters() {
    const dispatch = useDispatch();

    const account = useSelector(chosenAccountSelector);
    const { rewardFilter = {}, address } = account ?? ({} as Account);
    const { fromDate, toDate } = rewardFilter;

    const fromDateRef = useRef<InputTimestampRef>(null);
    const toDateRef = useRef<InputTimestampRef>(null);

    const booleanFilters = useMemo(
        () => getActiveBooleanFilters(rewardFilter),
        [rewardFilter]
    );

    const defaultValues = useMemo<FilterForm>(
        () => ({
            ...Object.keys(fieldNames).reduce(
                (acc, name) => ({
                    ...acc,
                    [name]: booleanFilters.includes(
                        name as TransactionKindString
                    ),
                }),
                {}
            ),
            toDate: toDate ? new Date(toDate) : undefined,
            fromDate: fromDate ? new Date(fromDate) : undefined,
            bakerTransactions: booleanFilters.includes(
                TransactionKindString.AddBaker
            ),
        }),
        [fromDate, toDate, booleanFilters]
    );

    const form = useForm<FilterForm>({ defaultValues });
    const { reset, handleSubmit, watch, trigger } = form;
    const { fromDate: fromDateValue } = watch([fieldNames.fromDate]);

    const submit = useCallback(
        (store: boolean) => (fields: FilterForm) => {
            const newFilter = (Object.entries(fields) as [
                keyof FilterForm,
                boolean | (Date | undefined)
            ][]).reduce((acc, [k, v]) => {
                if (isDateField(k)) {
                    return { ...acc, [k]: (v as Date | undefined)?.toString() };
                }

                const filterGroup = transactionFilters.find(
                    (t) => t.field === k
                )?.group;

                if (!filterGroup) {
                    return { ...acc, [k]: v as boolean };
                }

                return { ...acc, ...getGroupValues(filterGroup, v as boolean) };
            }, rewardFilter);

            updateRewardFilter(dispatch, address, newFilter, store);
        },
        [rewardFilter, dispatch, address]
    );

    const clear = useCallback(async () => {
        await clearRewardFilters(dispatch, address);
        fromDateRef.current?.clear();
        toDateRef.current?.clear();
    }, [dispatch, address]);

    useEffect(() => {
        reset({ ...defaultValues });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [defaultValues]);

    useEffect(() => {
        trigger(fieldNames.toDate);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fromDateValue]);

    if (!account) {
        return null;
    }

    return (
        <FormProvider {...form}>
            <section className={styles.root}>
                <Form.Timestamp
                    name={fieldNames.fromDate}
                    className="mT20"
                    label="From:"
                    rules={{
                        validate: {
                            pastDate: pastDateValidator,
                        },
                    }}
                    ref={fromDateRef}
                />
                <Form.Timestamp
                    name={fieldNames.toDate}
                    className="mT20"
                    label="To:"
                    rules={{
                        validate: {
                            pastDate: pastDateValidator,
                            minToDate(v?: Date) {
                                if (!v || !fromDateValue) {
                                    return true;
                                }
                                return allowOptional(
                                    minDate(
                                        fromDateValue,
                                        ' Must be after date specified in first date field'
                                    )
                                )(v);
                            },
                        },
                    }}
                    ref={toDateRef}
                />
                <div className="m40 mB10 flexColumn">
                    {transactionFilters.map(({ field, display }) => (
                        <Form.Checkbox
                            name={field}
                            size="large"
                            key={field}
                            className="textRight mB10"
                        >
                            {display}
                        </Form.Checkbox>
                    ))}
                    <Button className="mT20" onClick={clear}>
                        Clear filters
                    </Button>
                    <Button
                        className="mT10"
                        onClick={handleSubmit(submit(false))}
                    >
                        Apply momentarily
                    </Button>
                    <Button
                        className="mT10"
                        onClick={handleSubmit(submit(true))}
                    >
                        Apply and save
                    </Button>
                </div>
            </section>
        </FormProvider>
    );
}
