import { ChainParameters, ChainParametersV0 } from '@concordium/web-sdk';
import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';

import Form from '~/components/Form';
import Label from '~/components/Label';
import { MultiStepFormPageProps } from '~/components/MultiStepForm';
import { accountInfoSelector } from '~/features/AccountSlice';
import { toFixed } from '~/utils/numberStringHelpers';
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

const fromDecimalsToPercentages = (decimals: Commissions): Commissions => ({
    transactionFeeCommission: decimals.transactionFeeCommission * 100,
    bakingRewardCommission: decimals.bakingRewardCommission * 100,
    finalizationRewardCommission: decimals.finalizationRewardCommission * 100,
});

const fromPercentagesToDecimals = (percentages: Commissions): Commissions => ({
    transactionFeeCommission: percentages.transactionFeeCommission / 100,
    bakingRewardCommission: percentages.bakingRewardCommission / 100,
    finalizationRewardCommission:
        percentages.finalizationRewardCommission / 100,
});

const formatCommission = toFixed(3);

const renderExistingValue = (value: number) =>
    formatCommission((value * 100).toString());

interface CommissionFieldProps {
    label: string;
    name: string;
    /** Decimal */
    min: number;
    /** Decimal */
    max: number;
    /** Decimal */
    existing: number | undefined;
}

const CommissionField = ({
    label,
    name,
    min,
    max,
    existing,
}: CommissionFieldProps) => {
    const minPercentage = min * 100;
    const maxPercentage = max * 100;

    if (min === max) {
        return (
            <>
                <Form.Input type="hidden" name={name} value={minPercentage} />
                <div className={commonSliderProps.className}>
                    <Label className="mB5">{label}</Label>
                    <span className="textFaded body2">{minPercentage}%</span>
                </div>
            </>
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
                min={minPercentage}
                max={maxPercentage}
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
    chainParameters: Exclude<ChainParameters, ChainParametersV0>;
}

export default function CommissionsPage({
    initial,
    onNext,
    account,
    chainParameters,
}: CommissionsPageProps) {
    const accountInfo = useSelector(accountInfoSelector(account));

    const { commissions: existing } = getExistingBakerValues(accountInfo) ?? {};
    const defaultValues: Commissions = {
        ...getDefaultCommissions(chainParameters),
        ...existing,
        ...initial,
    };

    const handleSubmit = useCallback(
        (values: Commissions) => {
            const finalizationRewardCommission =
                chainParameters.finalizationCommissionRange.max;
            onNext({
                ...fromPercentagesToDecimals(values),
                finalizationRewardCommission,
            });
        },
        [onNext]
    );

    return (
        <Form<Commissions>
            onSubmit={handleSubmit}
            defaultValues={fromDecimalsToPercentages(defaultValues)}
            className="flexColumn flexChildFill"
        >
            <div className="flexChildFill">
                <p className="mB30 mT0">
                    When you open your validator as a pool, you earn commissions
                    of stake delegated to your pool from other accounts:
                </p>
                <CommissionField
                    label="Transaction fee commissions"
                    name={commissionsFieldNames.transactionFeeCommission}
                    min={chainParameters.transactionCommissionRange.min}
                    max={chainParameters.transactionCommissionRange.max}
                    existing={existing?.transactionFeeCommission}
                />
                <CommissionField
                    label="Block reward commissions"
                    name={commissionsFieldNames.bakingRewardCommission}
                    min={chainParameters.bakingCommissionRange.min}
                    max={chainParameters.bakingCommissionRange.max}
                    existing={existing?.bakingRewardCommission}
                />
            </div>
            <Form.Submit className={styles.continue}>Continue</Form.Submit>
        </Form>
    );
}
