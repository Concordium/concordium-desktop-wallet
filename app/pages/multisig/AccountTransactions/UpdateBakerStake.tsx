/* eslint-disable react/display-name */
import React, { ComponentType, useCallback } from 'react';
import { Redirect, useRouteMatch } from 'react-router';
import { useSelector } from 'react-redux';
import { ConfigureBaker, Fraction } from '~/utils/types';
import MultiSigAccountTransactionFlow, {
    MultiSigAccountTransactionFlowLoading,
    RequiredValues,
} from './MultiSigAccountTransactionFlow';
import { AmountDetail, PlainDetail } from './proposal-details/shared';
import withExchangeRate from '~/components/Transfers/withExchangeRate';
import { ensureProps } from '~/utils/componentHelpers';
import { isDefined } from '~/utils/basicHelpers';
import {
    convertToTransaction,
    Dependencies,
    displayRestakeEarnings,
    getEstimatedFee,
} from '~/utils/transactionFlows/configureBaker';
import DisplayEstimatedFee from '~/components/DisplayEstimatedFee';
import {
    title,
    UpdateBakerStakeFlowState,
} from '~/utils/transactionFlows/updateBakerStake';
import withChainData from '~/utils/withChainData';
import UpdateBakerStakePage from '~/components/Transfers/configureBaker/UpdateBakerStakePage';

import displayTransferStyles from '~/components/Transfers/transferDetails.module.scss';
import { accountsInfoSelector } from '~/features/AccountSlice';

interface DisplayProps
    extends Partial<RequiredValues & UpdateBakerStakeFlowState> {
    exchangeRate: Fraction;
}
const DisplayValues = ({ account, exchangeRate, stake }: DisplayProps) => {
    const estimatedFee =
        account !== undefined
            ? getEstimatedFee(
                  { stake },
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
            {stake?.stake !== undefined && (
                <AmountDetail title="Staked amount" value={stake?.stake} />
            )}
            {stake?.restake !== undefined && (
                <PlainDetail
                    title="Restake earnings"
                    value={
                        stake?.restake !== undefined
                            ? displayRestakeEarnings(stake.restake)
                            : undefined
                    }
                />
            )}
        </>
    );
};

type Props = Omit<Dependencies, 'account' | 'nonce'>;
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
                <MultiSigAccountTransactionFlowLoading title={title} />
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
            convertToTransaction(
                account,
                nonce,
                exchangeRate,
                accountsInfo[account.address]
            )(values),
        [exchangeRate, accountsInfo]
    );

    return (
        <MultiSigAccountTransactionFlow<
            UpdateBakerStakeFlowState,
            ConfigureBaker
        >
            title={title}
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
