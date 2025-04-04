/* eslint-disable react/display-name */
import React, { ComponentType, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Redirect, useRouteMatch } from 'react-router';
import { AccountInfoType } from '@concordium/web-sdk';

import { ConfigureDelegation, Fraction } from '~/utils/types';
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

import MultiSigAccountTransactionFlow, {
    MultiSigAccountTransactionFlowLoading,
    RequiredValues,
} from './MultiSigAccountTransactionFlow';
import { TitleDetail } from './proposal-details/shared';

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
            <TitleDetail title="Stop delegation" />
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
            ConfigureDelegation
        >
            title={removeDelegationTitle}
            convert={convert}
            accountFilter={(_, i) =>
                isDefined(i) && i.type === AccountInfoType.Delegator
            }
            preview={(p) => (
                <DisplayValues {...p} exchangeRate={exchangeRate} />
            )}
        >
            {({ account }) => ({
                confirm: {
                    title: 'Cooldown period',
                    render: (_, onNext) =>
                        isDefined(account) ? (
                            <RemoveDelegationPage
                                onNext={onNext}
                                accountInfo={accountsInfo[account.address]}
                            />
                        ) : (
                            <Redirect to={matchedPath} />
                        ),
                },
            })}
        </MultiSigAccountTransactionFlow>
    );
});
