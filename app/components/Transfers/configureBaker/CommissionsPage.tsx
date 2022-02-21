import { RewardFraction } from '@concordium/node-sdk';
import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';

import Form from '~/components/Form';
import Label from '~/components/Label';
import { MultiStepFormPageProps } from '~/components/MultiStepForm';
import { accountInfoSelector } from '~/features/AccountSlice';
import { toFixed } from '~/utils/numberStringHelpers';
import {
    fractionResolutionToPercentage,
    percentageToFractionResolution,
} from '~/utils/rewardFractionHelpers';
import {
    Commissions,
    ConfigureBakerFlowState,
    getDefaultCommissions,
    getExistingBakerValues,
} from '~/utils/transactionFlows/configureBaker';
import { Account, EqualRecord, PropsOf } from '~/utils/types';

import styles from './ConfigureBakerPage.module.scss';

const commissionsFieldNames: EqualRecord<Commissions> = {
    transactionFeeCommission: 'transactionFeeCommission',
    bakingRewardCommission: 'bakingRewardCommission',
    finalizationRewardCommission: 'finalizationRewardCommission',
};

const commonSliderProps: Pick<
    PropsOf<typeof Form.Slider>,
    'step' | 'unit' | 'className'
> = {
    step: 0.001,
    unit: '%',
    className: 'mB30',
};

const fromRewardFractions = (values: Commissions): Commissions => ({
    transactionFeeCommission: fractionResolutionToPercentage(
        values.transactionFeeCommission
    ),
    bakingRewardCommission: fractionResolutionToPercentage(
        values.bakingRewardCommission
    ),
    finalizationRewardCommission: fractionResolutionToPercentage(
        values.finalizationRewardCommission
    ),
});

const formatCommission = toFixed(3);

const renderExistingValue = (value: number) =>
    formatCommission(fractionResolutionToPercentage(value).toString());

interface CommissionFieldProps {
    label: string;
    name: string;
    from: RewardFraction;
    to: RewardFraction;
    existing: RewardFraction | undefined;
}

const CommissionField = ({
    label,
    name,
    from,
    to,
    existing,
}: CommissionFieldProps) => {
    const fromFormatted = fractionResolutionToPercentage(from);
    const toFormatted = fractionResolutionToPercentage(to);

    if (from === to) {
        return (
            <div>
                <Label className="mB5">{label}</Label>
                <span className="textFaded body2">{fromFormatted}%</span>
            </div>
        );
    }

    return (
        <>
            {existing !== undefined && (
                <div className="body3 mono mB10">
                    Current value:
                    {renderExistingValue(existing)}%
                </div>
            )}
            <Form.Slider
                label={label}
                name={name}
                min={fromFormatted}
                max={toFormatted}
                {...commonSliderProps}
            />
        </>
    );
};

interface CommissionsPageProps
    extends Omit<
        MultiStepFormPageProps<Commissions, ConfigureBakerFlowState>,
        'formValues'
    > {
    account: Account;
}

export default function CommissionsPage({
    initial,
    onNext,
    account,
}: CommissionsPageProps) {
    const accountInfo = useSelector(accountInfoSelector(account));

    // TODO: get values from chain
    const boundaries: {
        [P in keyof Commissions]: [number, number];
    } = {
        transactionFeeCommission: [5000, 15000],
        bakingRewardCommission: [50000, 100000],
        finalizationRewardCommission: [100000, 100000],
    };

    const { commissions: existing } = getExistingBakerValues(accountInfo) ?? {};
    const defaultValues: Commissions = {
        ...getDefaultCommissions(),
        ...existing,
        ...initial,
    };

    const handleSubmit = useCallback(
        (values: Commissions) =>
            onNext({
                transactionFeeCommission: percentageToFractionResolution(
                    values.transactionFeeCommission
                ),
                bakingRewardCommission: percentageToFractionResolution(
                    values.bakingRewardCommission
                ),
                finalizationRewardCommission: percentageToFractionResolution(
                    values.finalizationRewardCommission
                ),
            }),
        [onNext]
    );

    return (
        <Form<Commissions>
            onSubmit={handleSubmit}
            defaultValues={fromRewardFractions(defaultValues)}
            className="flexColumn flexChildFill"
        >
            <div className="flexChildFill">
                <p className="mB30">
                    When you open your baker as a pool, you have to set
                    commission rates. You can do so below:
                </p>
                <CommissionField
                    label="Transaction fee commissions"
                    name={commissionsFieldNames.transactionFeeCommission}
                    from={boundaries.transactionFeeCommission[0]}
                    to={boundaries.transactionFeeCommission[1]}
                    existing={existing?.transactionFeeCommission}
                />
                <CommissionField
                    label="Baking reward commissions"
                    name={commissionsFieldNames.bakingRewardCommission}
                    from={boundaries.bakingRewardCommission[0]}
                    to={boundaries.bakingRewardCommission[1]}
                    existing={existing?.bakingRewardCommission}
                />
                <CommissionField
                    label="Finalization reward commissions"
                    name={commissionsFieldNames.finalizationRewardCommission}
                    from={boundaries.finalizationRewardCommission[0]}
                    to={boundaries.finalizationRewardCommission[1]}
                    existing={existing?.finalizationRewardCommission}
                />
            </div>
            <Form.Submit className={styles.continue}>Continue</Form.Submit>
        </Form>
    );
}
