/* eslint-disable react/display-name */
import React, { ComponentType, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Redirect, useRouteMatch } from 'react-router';
import { isBakerAccount } from '@concordium/web-sdk';
import { ConfigureBaker, Fraction } from '~/utils/types';
import MultiSigAccountTransactionFlow, {
    MultiSigAccountTransactionFlowLoading,
    RequiredValues,
} from './MultiSigAccountTransactionFlow';
import { TitleDetail } from './proposal-details/shared';
import withExchangeRate from '~/components/Transfers/withExchangeRate';
import { ensureProps } from '~/utils/componentHelpers';
import { isDefined } from '~/utils/basicHelpers';
import { accountsInfoSelector } from '~/features/AccountSlice';
import {
    RemoveBakerDependencies,
    RemoveBakerFlowState,
    convertToRemoveBakerTransaction,
    removeBakerTitle,
} from '~/utils/transactionFlows/removeBaker';
import RemoveBakerPage from '~/components/Transfers/configureBaker/RemoveBakerPage';
import { getEstimatedConfigureBakerFee } from '~/utils/transactionFlows/configureBaker';
import DisplayEstimatedFee from '~/components/DisplayEstimatedFee';

import displayTransferStyles from '~/components/Transfers/transferDetails.module.scss';

interface DisplayProps extends Partial<RequiredValues & RemoveBakerFlowState> {
    exchangeRate: Fraction;
}
const DisplayValues = ({ account, exchangeRate }: DisplayProps) => {
    const estimatedFee =
        account !== undefined
            ? getEstimatedConfigureBakerFee(
                  { stake: { stake: '0' } },
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
            <TitleDetail title="Stop validation" />
        </>
    );
};

type Props = RemoveBakerDependencies;
type UnsafeProps = Partial<Props>;

const hasNecessaryProps = (props: UnsafeProps): props is Props =>
    [props.exchangeRate].every(isDefined);

const withDeps = (component: ComponentType<Props>) =>
    withExchangeRate(
        ensureProps(
            component,
            hasNecessaryProps,
            <MultiSigAccountTransactionFlowLoading title={removeBakerTitle} />
        )
    );

export default withDeps(function RemoveBaker({ exchangeRate }: Props) {
    const accountsInfo = useSelector(accountsInfoSelector);
    const { path: matchedPath } = useRouteMatch();

    const convert = useCallback(
        (
            { account, expiry }: RequiredValues & RemoveBakerFlowState,
            nonce: bigint
        ) =>
            convertToRemoveBakerTransaction(
                account,
                nonce,
                exchangeRate
            )(expiry),
        [exchangeRate]
    );

    return (
        <MultiSigAccountTransactionFlow<RemoveBakerFlowState, ConfigureBaker>
            title={removeBakerTitle}
            convert={convert}
            accountFilter={(_, i) => isDefined(i) && isBakerAccount(i)}
            preview={(p) => (
                <DisplayValues {...p} exchangeRate={exchangeRate} />
            )}
        >
            {({ account }) => ({
                confirm: {
                    title: 'Cooldown period',
                    render: (_, onNext) =>
                        isDefined(account) ? (
                            <RemoveBakerPage
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
