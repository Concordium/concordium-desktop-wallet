import React, { useMemo } from 'react';
import BakerStakeSettings from '~/components/BakerTransactions/BakerStakeSettings';
import { MultiStepFormPageProps } from '~/components/MultiStepForm';
import { microGtuToGtu } from '~/utils/gtu';
import {
    ConfigureBakerFlowDependencies,
    StakeSettings,
} from '~/utils/transactionFlows/configureBaker';
import {
    getEstimatedAddBakerFee,
    AddBakerFlowState,
} from '~/utils/transactionFlows/addBaker';
import { Account } from '~/utils/types';

import styles from './ConfigureBakerPage.module.scss';

interface Props
    extends MultiStepFormPageProps<StakeSettings, AddBakerFlowState>,
        Pick<ConfigureBakerFlowDependencies, 'blockSummary' | 'exchangeRate'> {
    isMultiSig?: boolean;
    account: Account;
}

export default function AddBakerStakePage({
    onNext,
    initial,
    formValues,
    blockSummary,
    exchangeRate,
    account,
    isMultiSig = false,
}: Props) {
    const minimumStake = BigInt(
        blockSummary.updates.chainParameters.minimumThresholdForBaking
    );
    const { stake, ...otherValues } = formValues;
    const hasKeys = otherValues.keys !== undefined;

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
            getEstimatedAddBakerFee(
                exchangeRate,
                hasKeys
                    ? {
                          stake: defaultValues,
                          ...otherValues,
                      }
                    : undefined,
                account.signatureThreshold
            ),
        [
            exchangeRate,
            account.signatureThreshold,
            defaultValues,
            otherValues,
            hasKeys,
        ]
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
