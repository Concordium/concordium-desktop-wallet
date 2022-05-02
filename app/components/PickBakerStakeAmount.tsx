import clsx from 'clsx';
import React, { useCallback } from 'react';
import { useFormContext, Validate } from 'react-hook-form';
import { isRewardStatusV1 } from '@concordium/node-sdk/lib/src/rewardStatusHelpers';
import { isBakerAccount } from '@concordium/node-sdk/lib/src/accountHelpers';
import { collapseFraction } from '~/utils/basicHelpers';
import {
    getCcdSymbol,
    ccdToMicroCcd,
    isValidCcdString,
    displayAsCcd,
} from '~/utils/ccd';
import {
    useCalcBakerStakeCooldownUntil,
    useCapitalBound,
} from '~/utils/dataHooks';
import { useUpdateEffect, useAsyncMemo } from '~/utils/hooks';
import { getFormattedDateString } from '~/utils/timeHelpers';
import { validateBakerStake } from '~/utils/transactionHelpers';
import { AccountInfo, Fraction } from '~/utils/types';
import Form from './Form';
import ErrorMessage from './Form/ErrorMessage';
import Label from './Label';
import updateConstants from '~/constants/updateConstants.json';
import { getRewardStatusLatest } from '~/node/nodeHelpers';

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

/**
 * Check whether the proposed stake will cause the account to breach the capital bound.
 */
function useCapitalBoundCheck(
    accountInfo: AccountInfo | undefined,
    stake: string
) {
    const rewardStatus = useAsyncMemo(getRewardStatusLatest);
    const capitalBound = useCapitalBound();

    if (
        !capitalBound ||
        !isValidCcdString(stake) ||
        !rewardStatus ||
        !isRewardStatusV1(rewardStatus)
    ) {
        return { showWarning: false, limitAfterUpdate: 0n };
    }
    const newStake = ccdToMicroCcd(stake);
    const currentStake =
        accountInfo && isBakerAccount(accountInfo)
            ? accountInfo.accountBaker.stakedAmount
            : 0n;
    const newTotalStake =
        rewardStatus.totalStakedCapital - currentStake + newStake;
    const limitAfterUpdate =
        (newTotalStake *
            BigInt(capitalBound * updateConstants.rewardFractionResolution)) /
        BigInt(updateConstants.rewardFractionResolution);
    return { showWarning: limitAfterUpdate < newStake, limitAfterUpdate };
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
    const cooldownUntil = useCalcBakerStakeCooldownUntil();
    const stake = form.watch(fieldName) ?? initial;
    const { showWarning, limitAfterUpdate } = useCapitalBoundCheck(
        accountInfo,
        stake
    );
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
    const showCooldown =
        existing !== undefined &&
        errors[fieldName] === undefined &&
        stake < existing;

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
                <span
                    className={clsx(
                        hasPendingChange ? 'textFaded' : 'textBlue'
                    )}
                >
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
            {cooldownUntil && showCooldown && (
                <div className="textFaded">
                    Will take effect at
                    <span className="block bodyEmphasized mT5">
                        {getFormattedDateString(cooldownUntil)}
                    </span>
                </div>
            )}
            {limitAfterUpdate && showWarning && (
                <div className="textFaded">
                    Chosen stake exceeds the capital bound, meaning that your
                    stake over the bound will not yield any returns. Estimated
                    bound:
                    <span className="block bodyEmphasized mT5">
                        {displayAsCcd(limitAfterUpdate)}
                    </span>
                </div>
            )}
        </div>
    );
}
