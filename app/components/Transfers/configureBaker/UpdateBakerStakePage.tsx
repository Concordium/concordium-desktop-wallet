import React, { useMemo } from 'react';
import BakerStakeSettings from '~/components/BakerTransactions/BakerStakeSettings';
import { MultiStepFormPageProps } from '~/components/MultiStepForm';
import { microGtuToGtu } from '~/utils/gtu';
import {
    Dependencies,
    StakeSettings,
    getEstimatedFee,
    getChanges,
} from '~/utils/transactionFlows/configureBaker';
import { UpdateBakerStakeFlowState } from '~/utils/transactionFlows/updateBakerStake';

import styles from './ConfigureBakerPage.module.scss';

interface Props
    extends MultiStepFormPageProps<StakeSettings, UpdateBakerStakeFlowState>,
        Pick<Dependencies, 'blockSummary' | 'exchangeRate' | 'account'> {
    isMultiSig?: boolean;
    existingValues: StakeSettings;
}

export default function AddBakerStakePage({
    onNext,
    initial,
    formValues,
    blockSummary,
    exchangeRate,
    account,
    existingValues,
    isMultiSig = false,
}: Props) {
    const minimumStake = BigInt(
        blockSummary.updates.chainParameters.minimumThresholdForBaking
    );
    const { stake } = formValues;

    const defaultValues: StakeSettings = useMemo(
        () => ({
            stake: microGtuToGtu(minimumStake.toString()) ?? '0.00',
            restake: true,
            ...initial,
        }),
        [initial, minimumStake]
    );

    const changes = getChanges({ stake: existingValues }, { stake });

    const estimatedFee = useMemo(
        () =>
            getEstimatedFee(changes, exchangeRate, account.signatureThreshold),
        [exchangeRate, account.signatureThreshold, changes]
    );

    return (
        <BakerStakeSettings
            onSubmit={onNext}
            initialData={defaultValues}
            account={account}
            estimatedFee={estimatedFee}
            minimumStake={minimumStake}
            buttonClassName={styles.continue}
            showAccountCard={isMultiSig}
        />
    );
}
