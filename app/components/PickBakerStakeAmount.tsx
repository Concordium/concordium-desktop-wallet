import React, { useCallback } from 'react';
import { useFormContext, Validate } from 'react-hook-form';
import { collapseFraction } from '~/utils/basicHelpers';
import { getGTUSymbol } from '~/utils/gtu';
import { useUpdateEffect } from '~/utils/hooks';
import { validateBakerStake } from '~/utils/transactionHelpers';
import { AccountInfo, Fraction } from '~/utils/types';
import Form from './Form';
import ErrorMessage from './Form/ErrorMessage';
import Label from './Label';

interface Props {
    minimumStake: bigint;
    fieldName: string;
    accountInfo?: AccountInfo;
    estimatedFee?: Fraction;
}

export default function PickBakerStakeAmount({
    minimumStake,
    fieldName,
    accountInfo,
    estimatedFee,
}: Props) {
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
        <div className="mV50">
            <Label>Amount:</Label>
            <div className="body1">
                {getGTUSymbol()}{' '}
                <Form.GtuInput
                    defaultValue="0.00"
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
