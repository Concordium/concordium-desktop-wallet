/* eslint-disable react/display-name */
import React, { ComponentType, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Redirect, useRouteMatch } from 'react-router';
import { ConfigureBaker, Fraction } from '~/utils/types';
import MultiSigAccountTransactionFlow, {
    MultiSigAccountTransactionFlowLoading,
    RequiredValues,
} from './MultiSigAccountTransactionFlow';
import { AmountDetail } from './proposal-details/shared';
import withExchangeRate from '~/components/Transfers/withExchangeRate';
import { ensureProps } from '~/utils/componentHelpers';
import { isDefined } from '~/utils/basicHelpers';
import { accountsInfoSelector } from '~/features/AccountSlice';
import DisplayEstimatedFee from '~/components/DisplayEstimatedFee';
import {
    convertToRemoveDelegationTransaction,
    RemoveDelegationDependencies,
    RemoveDelegationFlowState,
    removeDelegationTitle,
} from '~/utils/transactionFlows/removeDelegation';
import { getEstimatedConfigureDelegationFee } from '~/utils/transactionFlows/configureDelegation';
import RemoveDelegationPage from '~/components/Transfers/configureDelegation/RemoveDelegationPage';

import displayTransferStyles from '~/components/Transfers/transferDetails.module.scss';

interface DisplayProps
    extends Partial<RequiredValues & RemoveDelegationFlowState> {
    exchangeRate: Fraction;
}
const DisplayValues = ({ account, exchangeRate }: DisplayProps) => {
    const estimatedFee =
        account !== undefined
            ? getEstimatedConfigureDelegationFee(
                  { delegate: { amount: '0' } },
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
            <AmountDetail title="Delegated amount" value="0" />
        </>
    );
};

type Props = RemoveDelegationDependencies;
type UnsafeProps = Partial<Props>;

const hasNecessaryProps = (props: UnsafeProps): props is Props =>
    [props.exchangeRate].every(isDefined);

const withDeps = (component: ComponentType<Props>) =>
    withExchangeRate(
        ensureProps(
            component,
            hasNecessaryProps,
            <MultiSigAccountTransactionFlowLoading
                title={removeDelegationTitle}
            />
        )
    );

export default withDeps(function RemoveDelegation({ exchangeRate }: Props) {
    const accountsInfo = useSelector(accountsInfoSelector);
    const { path: matchedPath } = useRouteMatch();

    const convert = useCallback(
        (
            { account, expiry }: RequiredValues & RemoveDelegationFlowState,
            nonce: bigint
        ) =>
            convertToRemoveDelegationTransaction(
                account,
                nonce,
                exchangeRate
            )(expiry),
        [exchangeRate]
    );

    return (
        <MultiSigAccountTransactionFlow<
            RemoveDelegationFlowState,
            ConfigureBaker
        >
            title={removeDelegationTitle}
            convert={convert}
            preview={(p) => (
                <DisplayValues {...p} exchangeRate={exchangeRate} />
            )}
        >
            {({ account }) => ({
                confirm: {
                    render: (_, onNext) =>
                        isDefined(account) ? (
                            <RemoveDelegationPage
                                onNext={onNext}
                                accountInfo={accountsInfo[account.address]}
                            />
                        ) : (
                            <Redirect to={matchedPath} />
                        ),
                    title: 'Cooldown period',
                },
            })}
        </MultiSigAccountTransactionFlow>
    );
});
