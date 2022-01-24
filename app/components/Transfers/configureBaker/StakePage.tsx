import React, { useMemo } from 'react';
import AddBakerStakeSettings from '~/components/BakerTransactions/AddBakerStakeSettings';
import { MultiStepFormPageProps } from '~/components/MultiStepForm';
import { microGtuToGtu } from '~/utils/gtu';
import {
    AddBakerFlowState,
    getEstimatedFee,
} from '~/utils/transactionFlows/addBaker';
import {
    Dependencies,
    StakeSettings,
} from '~/utils/transactionFlows/configureBaker';

import styles from './ConfigureBakerPage.module.scss';

interface Props
    extends MultiStepFormPageProps<StakeSettings, AddBakerFlowState>,
        Pick<Dependencies, 'blockSummary' | 'exchangeRate' | 'account'> {}

export default function StakePage({
    onNext,
    initial,
    formValues,
    blockSummary,
    exchangeRate,
    account,
}: Props) {
    const minimumStake = BigInt(
        blockSummary.updates.chainParameters.minimumThresholdForBaking
    );
    const { stake, ...otherValues } = formValues;

    const defaultValues: StakeSettings = useMemo(
        () => ({
            stake: microGtuToGtu(minimumStake.toString()) ?? '0.00',
            restake: true,
            ...initial,
        }),
        [initial, minimumStake]
    );

    const estimatedFee = useMemo(
        () =>
            getEstimatedFee(
                {
                    stake: defaultValues,
                    ...otherValues,
                } as AddBakerFlowState,
                exchangeRate,
                account.signatureThreshold
            ),
        [exchangeRate, account.signatureThreshold, defaultValues, otherValues]
    );

    return (
        <AddBakerStakeSettings
            onSubmit={onNext}
            initialData={defaultValues}
            account={account}
            estimatedFee={estimatedFee}
            minimumStake={minimumStake}
            buttonClassName={styles.continue}
        />
    );
}
