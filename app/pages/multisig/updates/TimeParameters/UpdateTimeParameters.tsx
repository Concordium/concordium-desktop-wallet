import React, { useMemo } from 'react';
import { Validate, useFormContext } from 'react-hook-form';
import { isBlockSummaryV0 } from '@concordium/node-sdk/lib/src/blockSummaryHelpers';
import { EqualRecord } from '~/utils/types';
import { UpdateProps } from '~/utils/transactionTypes';
import Form from '~/components/Form/';
import MintRateInput, { FormMintRateInput } from '../common/MintRateInput';
import { getCurrentValue, getPaydaysPerYear } from './util';
import { parseMintRate } from '~/utils/mintDistributionHelpers';
import Label from '~/components/Label';
import { mustBeAnInteger, requiredMessage, enterHere } from '../common/util';

export interface UpdateTimeParametersFields {
    mintPerPayday: string;
    rewardPeriodLength: bigint;
}

const fieldNames: EqualRecord<UpdateTimeParametersFields> = {
    mintPerPayday: 'mintPerPayday',
    rewardPeriodLength: 'rewardPeriodLength',
};

const fieldDisplays = {
    mintPerPayday: 'mint per payday',
    rewardPeriodLength: 'reward period length',
};

const canParseMintPerPayday: Validate = (value?: string) =>
    (value !== undefined && parseMintRate(value) !== undefined) ||
    'Invalid mint per payday value';

const isValidNumber = (parseFun: (v: string) => number): Validate => (
    v: string
) => !Number.isNaN(parseFun(v)) || 'Value must be a valid number';

const isValidFloat = isValidNumber(parseFloat);

const MINT_PER_PAYDAY_MAX = 2 ** 32 - 1; // UInt32 upper bound

/**
 * Component for creating an update time parameters transaction.
 */
export default function UpdateTimeParameters({
    defaults,
    blockSummary,
    consensusStatus,
}: UpdateProps): JSX.Element | null {
    if (isBlockSummaryV0(blockSummary)) {
        throw new Error('Connected node used outdated blockSummary format');
    }

    const { mintPerPayday, rewardPeriodLength } = getCurrentValue(blockSummary);

    const form = useFormContext();
    const newRewardPeriodLength = form.watch(fieldNames.rewardPeriodLength);

    const currentPaydaysPerYear = useMemo(
        () => getPaydaysPerYear(rewardPeriodLength, consensusStatus),
        [rewardPeriodLength, consensusStatus]
    );

    const newPaydaysPerYear = useMemo(
        () =>
            newRewardPeriodLength
                ? getPaydaysPerYear(newRewardPeriodLength, consensusStatus)
                : currentPaydaysPerYear,
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [newRewardPeriodLength, consensusStatus]
    );

    return (
        <>
            <div>
                <Label className="mB5">Current mint rate</Label>
                <MintRateInput
                    value={mintPerPayday.toString()}
                    paydaysPerYear={currentPaydaysPerYear}
                    disabled
                    className="mB20 mono"
                />
                <Label className="mB5">Current reward period length:</Label>
                <div className="mono">
                    {rewardPeriodLength.toString()} epochs
                </div>
            </div>
            <div>
                <Label className="mB5">New mint rate</Label>
                <FormMintRateInput
                    name={fieldNames.mintPerPayday}
                    defaultValue={
                        defaults.mintPerPayday || mintPerPayday.toString()
                    }
                    paydaysPerYear={newPaydaysPerYear}
                    className="mB20"
                    rules={{
                        required: 'Mint per payday value is required',
                        min: {
                            value: 0,
                            message: "Mint per payday value can't be negative",
                        },
                        max: {
                            value: MINT_PER_PAYDAY_MAX,
                            message: `Mint per payday cannot exceed ${MINT_PER_PAYDAY_MAX}`,
                        },
                        validate: {
                            isValidFloat,
                            canParseMintPerPayday,
                        },
                    }}
                />
                <Form.Input
                    className="body2"
                    name={fieldNames.rewardPeriodLength}
                    defaultValue={
                        defaults.rewardPeriodLength ||
                        rewardPeriodLength.toString()
                    }
                    label={`${fieldDisplays.rewardPeriodLength} (epochs)`}
                    placeholder={enterHere(fieldDisplays.rewardPeriodLength)}
                    rules={{
                        required: requiredMessage(
                            fieldDisplays.rewardPeriodLength
                        ),
                        min: {
                            value: 1,
                            message: `${fieldDisplays.rewardPeriodLength} must be positive`,
                        },
                        max: {
                            value: '18446744073709551615',
                            message: `${fieldDisplays.rewardPeriodLength} must be below 18446744073709551615`,
                        },
                        validate: {
                            mustBeAnInteger,
                        },
                    }}
                />
            </div>
        </>
    );
}
