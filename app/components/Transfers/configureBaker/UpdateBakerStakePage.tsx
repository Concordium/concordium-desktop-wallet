import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import BakerStakeSettings from '~/components/BakerTransactions/BakerStakeSettings';
import { MultiStepFormPageProps } from '~/components/MultiStepForm';
import { accountInfoSelector } from '~/features/AccountSlice';
import {
    Dependencies,
    StakeSettings,
    getEstimatedFee,
    getChanges,
} from '~/utils/transactionFlows/configureBaker';
import {
    getExistingValues,
    UpdateBakerStakeFlowState,
} from '~/utils/transactionFlows/updateBakerStake';

import styles from './ConfigureBakerPage.module.scss';

interface Props
    extends MultiStepFormPageProps<StakeSettings, UpdateBakerStakeFlowState>,
        Pick<Dependencies, 'blockSummary' | 'exchangeRate' | 'account'> {
    isMultiSig?: boolean;
}

export default function UpdateBakerStakePage({
    onNext,
    initial,
    blockSummary,
    exchangeRate,
    account,
    isMultiSig = false,
}: Props) {
    const accountInfo = useSelector(accountInfoSelector(account));
    const existing = getExistingValues(accountInfo);
    const minimumStake = BigInt(
        blockSummary.updates.chainParameters.minimumThresholdForBaking
    );
    const changes = getChanges({ stake: existing }, { stake: initial });
    const defaultValues = { ...existing, ...initial };

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
            existingValues={existing}
        />
    );
}
