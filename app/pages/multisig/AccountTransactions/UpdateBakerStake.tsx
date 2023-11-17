/* eslint-disable react/display-name */
import React, { ComponentType, useCallback, useState } from 'react';
import { Redirect, useRouteMatch } from 'react-router';
import { useSelector } from 'react-redux';
import { isBakerAccount } from '@concordium/web-sdk';
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
import {
    accountInfoSelector,
    accountsInfoSelector,
} from '~/features/AccountSlice';
import { shouldShowField } from './utils';
import { ValidateValues } from '~/components/MultiStepForm';
import SimpleErrorModal from '~/components/SimpleErrorModal';

import displayTransferStyles from '~/components/Transfers/transferDetails.module.scss';

interface DisplayProps
    extends Partial<RequiredValues & UpdateBakerStakeFlowState> {
    exchangeRate: Fraction;
}
const DisplayValues = ({
    account,
    exchangeRate,
    expiry,
    ...values
}: DisplayProps) => {
    const accountInfo: AccountInfo | undefined = useSelector(
        accountInfoSelector(account)
    );
    const changes = getBakerFlowChanges(values, accountInfo) ?? values;
    const showField = shouldShowField(values, changes);

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
            {showField((v) => v.stake?.stake) && (
                <AmountDetail
                    title="Staked amount"
                    value={changes.stake?.stake}
                />
            )}
            {showField((v) => v.stake?.restake) && (
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
    return [props.exchangeRate, props.chainParameters].every(isDefined);
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
    chainParameters,
}: Props) {
    const { path: matchedPath } = useRouteMatch();
    const accountsInfo = useSelector(accountsInfoSelector);
    const [showError, setShowError] = useState(false);

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

    const validate: ValidateValues<
        RequiredValues & UpdateBakerStakeFlowState
    > = useCallback(
        (v) => {
            try {
                convert(v, 0n);
            } catch {
                setShowError(true);
                return 'stake';
            }
            return undefined;
        },
        [convert]
    );

    return (
        <>
            <SimpleErrorModal
                show={showError}
                onClick={() => setShowError(false)}
                header="Empty transaction"
                content="Transaction includes no changes to existing validator configuration for account."
            />
            <MultiSigAccountTransactionFlow<
                UpdateBakerStakeFlowState,
                ConfigureBaker
            >
                title={updateBakerStakeTitle}
                convert={convert}
                accountFilter={(_, i) => isDefined(i) && isBakerAccount(i)}
                preview={(v) => (
                    <DisplayValues {...v} exchangeRate={exchangeRate} />
                )}
                validate={validate}
            >
                {({ account }) => ({
                    stake: {
                        title: 'Stake settings',
                        render: (initial, onNext, formValues) =>
                            isDefined(account) ? (
                                <UpdateBakerStakePage
                                    account={account}
                                    exchangeRate={exchangeRate}
                                    chainParameters={chainParameters}
                                    initial={initial}
                                    onNext={onNext}
                                    formValues={formValues}
                                />
                            ) : (
                                <Redirect to={matchedPath} />
                            ),
                    },
                })}
            </MultiSigAccountTransactionFlow>
        </>
    );
});
