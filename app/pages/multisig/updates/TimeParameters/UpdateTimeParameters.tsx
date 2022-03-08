import React from 'react';
import { Validate } from 'react-hook-form';
import { isBlockSummaryV1 } from '@concordium/node-sdk/lib/src/blockSummaryHelpers';
import { EqualRecord } from '~/utils/types';
import { UpdateProps } from '~/utils/transactionTypes';
import Form from '~/components/Form/';
import MintRateInput, {
    FormMintRateInput,
} from './MintRateInput/MintRateInput';
import { getCurrentValue, getSlotsPerYear } from './util';
import { parseMintPerSlot } from '~/utils/mintDistributionHelpers';
import Label from '~/components/Label';

export interface UpdateTimeParametersFields {
    mintPerPayday: string;
    rewardPeriodLength: bigint;
}

const fieldNames: EqualRecord<UpdateTimeParametersFields> = {
    mintPerPayday: 'mintPerPayday',
    rewardPeriodLength: 'rewardPeriodLength',
};

const canParseMintPerSlot: Validate = (value?: string) =>
    (value !== undefined && parseMintPerSlot(value) !== undefined) ||
    'Invalid mint per slot value';

const isValidNumber = (parseFun: (v: string) => number): Validate => (
    v: string
) => !Number.isNaN(parseFun(v)) || 'Value must be a valid number';

const isValidFloat = isValidNumber(parseFloat);
const isValidInteger = isValidNumber(parseInt);

const MINT_PER_SLOT_MAX = 2 ** 32 - 1; // UInt32 upper bound

/**
 * Component for creating an update time parameters transaction.
 */
export default function UpdateTimeParameters({
    defaults,
    blockSummary,
    consensusStatus,
}: UpdateProps): JSX.Element | null {
    if (!isBlockSummaryV1(blockSummary)) {
        throw new Error('Connected node used outdated blockSummary format');
    }

    const { mintPerPayday, rewardPeriodLength } = getCurrentValue(blockSummary);

    const slotsPerYear = getSlotsPerYear(consensusStatus);

    return (
        <>
            <div>
                <Label className="mB5">Current mint distribution</Label>
                <MintRateInput
                    value={mintPerPayday.toString()}
                    slotsPerYear={slotsPerYear}
                    disabled
                    className="mB20"
                />
                <Label className="mB5">Current reward period length:</Label>
                {rewardPeriodLength} milliseconds
            </div>
            <div>
                <Label className="mB5">New mint distribution</Label>
                <FormMintRateInput
                    name={fieldNames.mintPerPayday}
                    defaultValue={
                        defaults.mintPerPayday || mintPerPayday.toString()
                    }
                    slotsPerYear={slotsPerYear}
                    className="mB20"
                    rules={{
                        required: 'Mint per slot value is required',
                        min: {
                            value: 0,
                            message: "Mint per slot value can't be negative",
                        },
                        max: {
                            value: MINT_PER_SLOT_MAX,
                            message: `Mint per slot cannot exceed ${MINT_PER_SLOT_MAX}`,
                        },
                        validate: {
                            isValidFloat,
                            canParseMintPerSlot,
                        },
                    }}
                />
                <Label className="mB5">New reward period length:</Label>
                <Form.InlineNumber
                    name={fieldNames.rewardPeriodLength}
                    defaultValue={
                        defaults.rewardPeriodLength || rewardPeriodLength
                    }
                    rules={{
                        min: {
                            value: 1,
                            message: 'Reward period length must be positive',
                        },
                        validate: { isValidInteger },
                    }}
                />{' '}
                milliseconds
            </div>
        </>
    );
}
