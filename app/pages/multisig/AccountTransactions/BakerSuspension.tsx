/* eslint-disable react/display-name */
import React, { ComponentType, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Redirect, useRouteMatch } from 'react-router';
import { AccountInfoType } from '@concordium/web-sdk';
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
    bakerSuspensionTitle,
    convertToBakerSuspensionTransaction,
    BakerSuspensionDependencies,
    BakerSuspensionFlowState,
} from '~/utils/transactionFlows/bakerSuspension';
import BakerSuspensionPage from '~/components/Transfers/configureBaker/BakerSuspensionPage';
import { getEstimatedConfigureBakerFee } from '~/utils/transactionFlows/configureBaker';
import DisplayEstimatedFee from '~/components/DisplayEstimatedFee';

import displayTransferStyles from '~/components/Transfers/transferDetails.module.scss';

type DisplayProps = Partial<RequiredValues & BakerSuspensionFlowState> & {
    exchangeRate: Fraction;
    isSuspended: boolean;
};

const DisplayValues = ({
    account,
    exchangeRate,
    isSuspended,
}: DisplayProps) => {
    const estimatedFee =
        account !== undefined
            ? getEstimatedConfigureBakerFee(
                  { suspended: !isSuspended },
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
            <TitleDetail title={bakerSuspensionTitle(isSuspended)} />
        </>
    );
};

type Props = BakerSuspensionDependencies;
type UnsafeProps = Partial<Props>;

const hasNecessaryProps = (props: UnsafeProps): props is Props =>
    [props.exchangeRate].every(isDefined);

const withDeps = (component: ComponentType<Props>) =>
    withExchangeRate(
        ensureProps(
            component,
            hasNecessaryProps,
            <MultiSigAccountTransactionFlowLoading title="Change suspension status" />
        )
    );

export default withDeps(function BakerSuspension({
    exchangeRate,
    isSuspended = false,
}: Props) {
    const accountsInfo = useSelector(accountsInfoSelector);
    const { path: matchedPath } = useRouteMatch();

    const convert = useCallback(
        (
            { account, expiry }: RequiredValues & BakerSuspensionFlowState,
            nonce: bigint
        ) =>
            convertToBakerSuspensionTransaction(
                account,
                nonce,
                exchangeRate
            )(isSuspended, expiry),
        [exchangeRate, isSuspended]
    );

    return (
        <MultiSigAccountTransactionFlow<
            BakerSuspensionFlowState,
            ConfigureBaker
        >
            title={bakerSuspensionTitle(isSuspended)}
            convert={convert}
            accountFilter={(_, i) =>
                isDefined(i) && i.type === AccountInfoType.Baker
            }
            preview={(p) => (
                <DisplayValues
                    {...p}
                    exchangeRate={exchangeRate}
                    isSuspended={isSuspended}
                />
            )}
        >
            {({ account }) => ({
                suspended: {
                    title: 'Change suspension status',
                    render: (_, onNext) =>
                        isDefined(account) ? (
                            <BakerSuspensionPage
                                onNext={onNext}
                                accountInfo={accountsInfo[account.address]}
                                isSuspended={isSuspended}
                            />
                        ) : (
                            <Redirect to={matchedPath} />
                        ),
                },
            })}
        </MultiSigAccountTransactionFlow>
    );
});
