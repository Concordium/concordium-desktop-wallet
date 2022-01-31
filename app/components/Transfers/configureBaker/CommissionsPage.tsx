import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';

import Form from '~/components/Form';
import { MultiStepFormPageProps } from '~/components/MultiStepForm';
import { accountInfoSelector } from '~/features/AccountSlice';
import { toFixed } from '~/utils/numberStringHelpers';
import {
    fractionResolutionToPercentage,
    percentageToFractionResolution,
} from '~/utils/rewardFractionHelpers';
import {
    Commissions,
    getDefaultCommissions,
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

interface CommissionsPageProps
    extends Omit<MultiStepFormPageProps<Commissions>, 'formValues'> {
    account: Account;
}

export default function CommissionsPage({
    initial,
    onNext,
    account,
}: CommissionsPageProps) {
    const accountInfo = useSelector(accountInfoSelector(account));
    // eslint-disable-next-line no-console
    console.log(accountInfo);

    // TODO: get values from chain
    const boundaries: {
        [P in keyof Commissions]: [number, number];
    } = {
        transactionFeeCommission: [5000, 15000],
        bakingRewardCommission: [5000, 15000],
        finalizationRewardCommission: [5000, 15000],
    };

    // TODO: get values from baker object on account info.
    const existingValues: Commissions | undefined = {
        ...getDefaultCommissions(),
    };
    const defaultValues: Commissions = {
        ...getDefaultCommissions(),
        ...existingValues,
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
                {existingValues?.transactionFeeCommission !== undefined && (
                    <div className="body3 mono mB10">
                        Current value:
                        {renderExistingValue(
                            existingValues.transactionFeeCommission
                        )}
                        %
                    </div>
                )}
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
                {existingValues?.bakingRewardCommission !== undefined && (
                    <div className="body3 mono mB10">
                        Current value:
                        {renderExistingValue(
                            existingValues.bakingRewardCommission
                        )}
                        %
                    </div>
                )}
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
                {existingValues?.finalizationRewardCommission !== undefined && (
                    <div className="body3 mono mB10">
                        Current value:
                        {renderExistingValue(
                            existingValues.finalizationRewardCommission
                        )}
                        %
                    </div>
                )}
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
            </div>
            <Form.Submit className={styles.continue}>Continue</Form.Submit>
        </Form>
    );
}
