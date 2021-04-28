/* eslint-disable jsx-a11y/label-has-associated-control */
import clsx from 'clsx';
import React, { useCallback, useMemo } from 'react';
import { useFormContext, Validate } from 'react-hook-form';
import ErrorMessage from '~/components/Form/ErrorMessage';
import { toFraction, toResolution } from '~/utils/numberStringHelpers';
import { convertMiliseconds } from '~/utils/timeHelpers';

import styles from './ElectionDifficultyInput.module.scss';

const resolution = 100000;

const parseFraction = toResolution(resolution);
const fraction = toFraction(resolution);

const validateResolutionConversion: Validate = (value: string) => {
    try {
        parseFraction(value);
        return true;
    } catch {
        return `Value must go into ${1 / resolution}`;
    }
};

export interface ElectionDifficultyField {
    electionDifficulty: string;
}

const fieldName: keyof ElectionDifficultyField = 'electionDifficulty';
const blockTimeError =
    'Estimated block time above 1 day is currently disallowed';

export interface ElectionDifficultyInputProps {
    label: string;
    timePerSlot: number;
    value: number | undefined;
    disabled?: boolean;
    readOnly?: boolean;
}

export default function ElectionDifficultyInput({
    label,
    value,
    timePerSlot,
    disabled = false,
    readOnly = false,
}: ElectionDifficultyInputProps): JSX.Element {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const initial = useMemo(() => fraction(value), []);
    const form = useFormContext<ElectionDifficultyField>();
    const error = form?.errors[fieldName];

    const getBlockTime = useCallback(
        (v: string) => {
            const n = Number(v);

            if (n < 0) {
                return undefined;
            }

            try {
                const msPerBlock = timePerSlot / Number(v);
                return convertMiliseconds(msPerBlock);
            } catch {
                return undefined;
            }
        },
        [timePerSlot]
    );

    const validateBlockTime: Validate = useCallback(
        (v: string) => {
            const { days } = getBlockTime(v) ?? {};
            return days === 0 || blockTimeError;
        },
        [getBlockTime]
    );

    const blockTime = useMemo(() => {
        if (error && error.message !== blockTimeError) {
            return undefined;
        }

        const v = form?.watch().electionDifficulty ?? initial;
        return getBlockTime(v);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form, getBlockTime, initial]);

    const { days, hours, minutes, seconds } = blockTime ?? {};
    const registration = form?.register({
        required: 'Must have a value',
        min: {
            value: 0,
            message: 'Value can not be negative',
        },
        max: {
            value: 1,
            message: 'Value can not be above 1',
        },
        validate: {
            validateResolutionConversion,
            validateBlockTime,
        },
    });

    return (
        <label className={styles.root}>
            <div className={styles.label}>{label}</div>
            <input
                className={clsx(styles.field, error && styles.fieldInvalid)}
                name={
                    registration !== undefined && !disabled
                        ? fieldName
                        : undefined
                }
                defaultValue={initial}
                type="number"
                disabled={disabled}
                readOnly={readOnly}
                step={1 / resolution}
                min={0}
                max={1}
                ref={registration}
            />
            {blockTime && (
                <span className={styles.blockTime}>
                    Approximate time per block: {Boolean(days) && `${days}d `}
                    {Boolean(hours) && `${hours}h `}
                    {Boolean(minutes) && `${minutes}m `}
                    {Boolean(seconds) && `${seconds}s `}
                </span>
            )}
            <ErrorMessage>{error?.message}</ErrorMessage>
        </label>
    );
}
