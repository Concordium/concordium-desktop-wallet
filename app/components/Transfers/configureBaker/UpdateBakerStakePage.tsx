import React, { useMemo } from 'react';
import { connect } from 'react-redux';
import BakerStakeSettings from '~/components/BakerTransactions/BakerStakeSettings';
import { MultiStepFormPageProps } from '~/components/MultiStepForm';
import { accountInfoSelector } from '~/features/AccountSlice';
import { RootState } from '~/store/store';
import { getMinimumStakeForBaking } from '~/utils/blockSummaryHelpers';
import {
    ConfigureBakerFlowDependencies,
    StakeSettings,
    getEstimatedConfigureBakerFee,
    getBakerFlowChanges,
    getExistingBakerValues,
} from '~/utils/transactionFlows/configureBaker';
import { UpdateBakerStakeFlowState } from '~/utils/transactionFlows/updateBakerStake';
import { Account, AccountInfo } from '~/utils/types';

import styles from './ConfigureBakerPage.module.scss';

interface Props
    extends MultiStepFormPageProps<StakeSettings, UpdateBakerStakeFlowState>,
        Pick<ConfigureBakerFlowDependencies, 'blockSummary' | 'exchangeRate'> {
    isMultiSig?: boolean;
    account: Account;
    accountInfo?: AccountInfo;
}

function UpdateBakerStakePage({
    onNext,
    initial,
    blockSummary,
    exchangeRate,
    account,
    accountInfo,
    isMultiSig = false,
}: Props) {
    const { stake: existing } = getExistingBakerValues(accountInfo) ?? {};
    const minimumStake = BigInt(getMinimumStakeForBaking(blockSummary));
    const changes = getBakerFlowChanges(
        { stake: existing },
        { stake: initial }
    );
    const defaultValues = { ...existing, ...initial };

    const estimatedFee = useMemo(
        () =>
            getEstimatedConfigureBakerFee(
                changes,
                exchangeRate,
                account.signatureThreshold
            ),
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

export default connect((s: RootState, p: Props) => ({
    accountInfo: accountInfoSelector(p.account)(s),
}))(UpdateBakerStakePage);
