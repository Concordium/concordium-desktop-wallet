import clsx from 'clsx';
import React, { useCallback } from 'react';
import { useFormContext, Validate } from 'react-hook-form';
import { collapseFraction } from '~/utils/basicHelpers';
import { getCcdSymbol } from '~/utils/ccd';
import { useUpdateEffect } from '~/utils/hooks';
import { validateBakerStake } from '~/utils/transactionHelpers';
import { AccountInfo, Fraction } from '~/utils/types';
import Form from './Form';
import ErrorMessage from './Form/ErrorMessage';
import Label from './Label';

interface Props {
    header: string;
    initial?: string;
    /** existing value in CCD. */
    existing?: string;
    minimumStake: bigint;
    fieldName: string;
    accountInfo: AccountInfo | undefined;
    estimatedFee: Fraction | undefined;
    hasPendingChange?: boolean;
}

export default function PickBakerStakeAmount({
    header,
    minimumStake,
    fieldName,
    accountInfo,
    estimatedFee,
    initial,
    existing,
    hasPendingChange,
}: Props): JSX.Element {
    const form = useFormContext<{ [key: string]: string }>();
    const validStakeAmount: Validate = useCallback(
        (value: string) =>
            validateBakerStake(
                minimumStake,
                value,
                accountInfo,
                estimatedFee && collapseFraction(estimatedFee)
            ),
        [minimumStake, accountInfo, estimatedFee]
    );

    useUpdateEffect(() => {
        if (!form || !form.formState.dirtyFields[fieldName]) {
            return;
        }

        form.trigger(fieldName);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [validStakeAmount, fieldName]);

    if (!form) {
        throw new Error('Must be used inside <Form />');
    }

    const { errors } = form;

    return (
        <div className="mV30">
            {existing && (
                <div className="body3 mono mB10">
                    Current stake: {getCcdSymbol()}
                    {existing}
                </div>
            )}
            <Label>{header}</Label>
            <div className="h1 mV5">
                <span className={clsx(hasPendingChange && 'textFaded')}>
                    {getCcdSymbol()}
                </span>
                <Form.CcdInput
                    disabled={hasPendingChange}
                    defaultValue={initial}
                    name={fieldName}
                    autoFocus
                    rules={{
                        required: 'Please specify amount to stake',
                        validate: validStakeAmount,
                    }}
                />
            </div>
            <ErrorMessage>{errors[fieldName]?.message}</ErrorMessage>
        </div>
    );
}
