import React, {
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useMemo,
} from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { setHours, setMinutes, setSeconds, setMilliseconds } from 'date-fns';
import {
    EqualRecord,
    NotOptional,
    TransactionFilter,
    TransactionKindString,
} from '~/utils/types';
import { getActiveBooleanFilters } from '~/utils/accountHelpers';
import Form from '~/components/Form';
import {
    allowOptional,
    minDate,
    pastDate,
} from '~/components/Form/util/validation';
import { useUpdateEffect } from '~/utils/hooks';

interface FilterForm
    extends Pick<
        TransactionFilter,
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
    toDate: Date | null | undefined;
    fromDate: Date | null | undefined;
    bakerTransactions: boolean;
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
        group: [
            TransactionKindString.Transfer,
            TransactionKindString.TransferWithMemo,
        ],
        display: 'Transfers',
    },
    {
        field: TransactionKindString.TransferWithSchedule,
        group: [
            TransactionKindString.TransferWithSchedule,
            TransactionKindString.TransferWithScheduleAndMemo,
        ],
        display: 'Scheduled transfers',
    },
    {
        field: TransactionKindString.TransferToEncrypted,
        display: 'Shielded amounts',
    },
    {
        field: TransactionKindString.TransferToPublic,
        display: 'Unshielded amounts',
    },
    {
        field: TransactionKindString.EncryptedAmountTransfer,
        group: [
            TransactionKindString.EncryptedAmountTransfer,
            TransactionKindString.EncryptedAmountTransferWithMemo,
        ],
        display: 'Shielded transfers',
    },
    {
        field: TransactionKindString.FinalizationReward,
        display: 'Finalization rewards',
    },
    {
        field: TransactionKindString.BakingReward,
        display: 'Baker rewards',
    },
    {
        field: TransactionKindString.BlockReward,
        display: 'Block rewards',
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
        {} as Partial<TransactionFilter>
    );

const pastDateValidator = allowOptional(
    pastDate('The time cannot be in the future')
);

const stripTime = (date: Date) =>
    setHours(setMinutes(setSeconds(setMilliseconds(date, 0), 0), 0), 0);

const isDateEqual = (left: Date | undefined, right: Date | undefined) => {
    if (left === undefined && right === undefined) {
        return true;
    }
    if (left === undefined || right === undefined) {
        return false;
    }

    return stripTime(left).getTime() === stripTime(right).getTime();
};

type Callback = (filter: TransactionFilter) => Promise<unknown>;

export interface TransactionFiltersRef {
    submit(cb: Callback): void;
    clear(cb: Callback): void;
}

interface TransactionFiltersProps {
    values?: TransactionFilter;
}

/**
 * Displays available transaction filters, and allows the user to activate/deactive them..
 *
 * Form submission/clearing should be triggered through public API.
 *
 * @example
 * const ref = useRef<TransactionFiltersRef>(null);
 * const [values, setValues] = useState<TransactionFilter>({});
 * ...
 * <TransactionFilters ref={ref} />
 * <Button onClick={() => ref.current?.submit(setValues)}>Apply</Button>
 * <Button onClick={() => ref.current?.clear(setValues)}>Clear</Button>
 */
const TransactionFilters = forwardRef<
    TransactionFiltersRef,
    TransactionFiltersProps
>(({ values }, ref) => {
    const fromDate = values?.fromDate;
    const toDate = values?.toDate;

    const booleanFilters = useMemo(
        () => getActiveBooleanFilters(values || {}),
        [values]
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
            toDate: toDate ? new Date(toDate) : null,
            fromDate: fromDate ? new Date(fromDate) : null,
            bakerTransactions: booleanFilters.includes(
                TransactionKindString.AddBaker
            ),
        }),
        [fromDate, toDate, booleanFilters]
    );

    const form = useForm<FilterForm>({ defaultValues, mode: 'onTouched' });
    const { reset, handleSubmit, watch, trigger } = form;
    const { fromDate: fromDateValue, toDate: toDateValue } = watch([
        fieldNames.fromDate,
        fieldNames.toDate,
    ]);

    const submit = useCallback(
        (cb: Callback) => (fields: FilterForm) => {
            const newFilter = (Object.entries(fields) as [
                keyof FilterForm,
                boolean | (Date | undefined)
            ][]).reduce((acc, [k, v]) => {
                if (isDateField(k)) {
                    return {
                        ...acc,
                        [k]: (v as Date | undefined)?.toString(),
                    };
                }

                const filterGroup = transactionFilters.find(
                    (t) => t.field === k
                )?.group;

                if (!filterGroup) {
                    return { ...acc, [k]: v as boolean };
                }

                return {
                    ...acc,
                    ...getGroupValues(filterGroup, v as boolean),
                };
            }, values || {});

            cb(newFilter);
        },
        [values]
    );

    const clear = useCallback((cb: Callback) => {
        cb({});
    }, []);

    useImperativeHandle(
        ref,
        () => ({
            submit: (cb) => handleSubmit(submit(cb))(),
            clear,
        }),
        [handleSubmit, submit, clear]
    );

    useUpdateEffect(() => {
        reset({ ...defaultValues });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [defaultValues]);

    useEffect(() => {
        trigger(fieldNames.toDate);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fromDateValue]);

    return (
        <FormProvider {...form}>
            <section className="pH40">
                <Form.DatePicker
                    name={fieldNames.fromDate}
                    className="mT20"
                    label="From:"
                    rules={{
                        validate: {
                            pastDate: pastDateValidator,
                        },
                    }}
                    maxDate={toDateValue ?? new Date()}
                    minTime={setHours(setMinutes(new Date(), 0), 0)}
                    maxTime={
                        fromDateValue &&
                        toDateValue &&
                        isDateEqual(toDateValue, fromDateValue ?? undefined)
                            ? toDateValue ?? undefined
                            : setHours(setMinutes(new Date(), 59), 23)
                    }
                />
                <Form.DatePicker
                    name={fieldNames.toDate}
                    className="mT20"
                    label="To:"
                    rules={{
                        validate: {
                            pastDate: pastDateValidator,
                            minToDate(v?: Date) {
                                if (!fromDateValue) {
                                    return true;
                                }
                                return allowOptional(
                                    minDate(
                                        fromDateValue,
                                        'Must be after "from" date'
                                    )
                                )(v);
                            },
                        },
                    }}
                    minDate={fromDateValue ?? undefined}
                    maxDate={new Date()}
                    minTime={
                        toDateValue &&
                        fromDateValue &&
                        isDateEqual(toDateValue, fromDateValue ?? undefined)
                            ? fromDateValue ?? undefined
                            : setHours(setMinutes(new Date(), 0), 0)
                    }
                    maxTime={
                        isDateEqual(new Date(), fromDateValue ?? undefined)
                            ? new Date()
                            : setHours(setMinutes(new Date(), 59), 23)
                    }
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
                </div>
            </section>
        </FormProvider>
    );
});

export default TransactionFilters;
