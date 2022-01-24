import React, { useCallback } from 'react';

import Form from '~/components/Form';
import { MultiStepFormPageProps } from '~/components/MultiStepForm';
import {
    fractionResolutionToPercentage,
    percentageToFractionResolution,
} from '~/utils/rewardFractionHelpers';
import {
    Commissions,
    getDefaultCommissions,
} from '~/utils/transactionFlows/configureBaker';
import { EqualRecord, PropsOf } from '~/utils/types';

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

type CommissionsPageProps = MultiStepFormPageProps<Commissions>;

export default function CommissionsPage({
    initial,
    onNext,
}: CommissionsPageProps) {
    // TODO: get values from chain
    const boundaries: {
        [P in keyof Commissions]: [number, number];
    } = {
        transactionFeeCommission: [5000, 15000],
        bakingRewardCommission: [5000, 15000],
        finalizationRewardCommission: [5000, 15000],
    };
    const defaultValues: Commissions = {
        ...getDefaultCommissions(),
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
        >
            <p className="mB30">
                When you open your baker as a pool, you have to set commission
                rates. You can do so below:
            </p>
            <Form.Slider
                label="Transaction fee commissions"
                name={commissionsFieldNames.transactionFeeCommission}
                min={fractionResolutionToPercentage(
                    boundaries.transactionFeeCommission[0]
                )}
                max={fractionResolutionToPercentage(
                    boundaries.transactionFeeCommission[1]
                )}
                {...commonSliderProps}
            />
            <Form.Slider
                label="Baking reward commissions"
                name={commissionsFieldNames.bakingRewardCommission}
                min={fractionResolutionToPercentage(
                    boundaries.bakingRewardCommission[0]
                )}
                max={fractionResolutionToPercentage(
                    boundaries.bakingRewardCommission[1]
                )}
                {...commonSliderProps}
            />
            <Form.Slider
                label="Finalization reward commissions"
                name={commissionsFieldNames.finalizationRewardCommission}
                min={fractionResolutionToPercentage(
                    boundaries.finalizationRewardCommission[0]
                )}
                max={fractionResolutionToPercentage(
                    boundaries.finalizationRewardCommission[1]
                )}
                {...commonSliderProps}
            />
            <Form.Submit className={styles.continue}>Continue</Form.Submit>
        </Form>
    );
}
