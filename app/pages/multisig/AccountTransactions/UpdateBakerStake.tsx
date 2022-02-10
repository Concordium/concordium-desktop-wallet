/* eslint-disable react/display-name */
import React, { ComponentType, useCallback } from 'react';
import { Redirect, useRouteMatch } from 'react-router';
import { useSelector } from 'react-redux';
import { AccountInfo, ConfigureBaker, Fraction } from '~/utils/types';
import MultiSigAccountTransactionFlow, {
    MultiSigAccountTransactionFlowLoading,
    RequiredValues,
} from './MultiSigAccountTransactionFlow';
import { AmountDetail, PlainDetail } from './proposal-details/shared';
import withExchangeRate from '~/components/Transfers/withExchangeRate';
import { ensureProps } from '~/utils/componentHelpers';
import { isDefined } from '~/utils/basicHelpers';
import {
    convertToBakerTransaction,
    ConfigureBakerFlowDependencies,
    displayRestakeEarnings,
    getBakerFlowChanges,
    getEstimatedConfigureBakerFee,
} from '~/utils/transactionFlows/configureBaker';
import DisplayEstimatedFee from '~/components/DisplayEstimatedFee';
import {
    updateBakerStakeTitle,
    UpdateBakerStakeFlowState,
} from '~/utils/transactionFlows/updateBakerStake';
import withChainData from '~/utils/withChainData';
import UpdateBakerStakePage from '~/components/Transfers/configureBaker/UpdateBakerStakePage';

import displayTransferStyles from '~/components/Transfers/transferDetails.module.scss';
import {
    accountInfoSelector,
    accountsInfoSelector,
} from '~/features/AccountSlice';

interface DisplayProps
    extends Partial<RequiredValues & UpdateBakerStakeFlowState> {
    exchangeRate: Fraction;
}
const DisplayValues = ({ account, exchangeRate, ...values }: DisplayProps) => {
    const accountInfo: AccountInfo | undefined = useSelector(
        accountInfoSelector(account)
    );
    const changes = getBakerFlowChanges(values, accountInfo) ?? values;
    const estimatedFee =
        account !== undefined
            ? getEstimatedConfigureBakerFee(
                  changes,
                  exchangeRate,
                  account.signatureThreshold
              )
            : undefined;
    return (
        <>
            <DisplayEstimatedFee
                className={displayTransferStyles.fee}
                estimatedFee={estimatedFee}
            />
            {(values.stake?.stake !== undefined &&
                changes.stake?.stake === undefined) || (
                <AmountDetail
                    title="Staked amount"
                    value={changes.stake?.stake}
                />
            )}
            {(values.stake?.restake !== undefined &&
                changes.stake?.restake === undefined) || (
                <PlainDetail
                    title="Restake earnings"
                    value={
                        changes.stake?.restake !== undefined
                            ? displayRestakeEarnings(changes.stake.restake)
                            : undefined
                    }
                />
            )}
        </>
    );
};

type Props = ConfigureBakerFlowDependencies;
type UnsafeProps = Partial<Props>;

const hasNecessaryProps = (props: UnsafeProps): props is Props => {
    return [props.exchangeRate, props.blockSummary].every(isDefined);
};

const withDeps = (component: ComponentType<Props>) =>
    withExchangeRate(
        withChainData(
            ensureProps(
                component,
                hasNecessaryProps,
                <MultiSigAccountTransactionFlowLoading
                    title={updateBakerStakeTitle}
                />
            )
        )
    );

export default withDeps(function UpdateBakerStake({
    exchangeRate,
    blockSummary,
}: Props) {
    const { path: matchedPath } = useRouteMatch();
    const accountsInfo = useSelector(accountsInfoSelector);

    const convert = useCallback(
        (
            { account, ...values }: RequiredValues & UpdateBakerStakeFlowState,
            nonce: bigint
        ) =>
            convertToBakerTransaction(
                account,
                nonce,
                exchangeRate,
                accountsInfo[account.address]
            )(values, values.expiry),
        [exchangeRate, accountsInfo]
    );

    return (
        <MultiSigAccountTransactionFlow<
            UpdateBakerStakeFlowState,
            ConfigureBaker
        >
            title={updateBakerStakeTitle}
            convert={convert}
            preview={(v) => (
                <DisplayValues {...v} exchangeRate={exchangeRate} />
            )}
        >
            {({ account }) => ({
                stake: {
                    render: (initial, onNext, formValues) =>
                        isDefined(account) ? (
                            <UpdateBakerStakePage
                                account={account}
                                exchangeRate={exchangeRate}
                                blockSummary={blockSummary}
                                initial={initial}
                                onNext={onNext}
                                formValues={formValues}
                            />
                        ) : (
                            <Redirect to={matchedPath} />
                        ),
                    title: 'Stake settings',
                },
            })}
        </MultiSigAccountTransactionFlow>
    );
});
