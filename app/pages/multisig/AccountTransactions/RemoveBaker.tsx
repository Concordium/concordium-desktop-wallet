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
import {
    Dependencies,
    RemoveBakerFlowState,
    convertToTransaction,
    title,
} from '~/utils/transactionFlows/removeBaker';
import RemoveBakerPage from '~/components/Transfers/configureBaker/RemoveBakerPage';
import { getEstimatedFee } from '~/utils/transactionFlows/configureBaker';
import DisplayEstimatedFee from '~/components/DisplayEstimatedFee';

import displayTransferStyles from '~/components/Transfers/transferDetails.module.scss';

interface DisplayProps extends Partial<RequiredValues & RemoveBakerFlowState> {
    exchangeRate: Fraction;
}
const DisplayValues = ({ account, exchangeRate }: DisplayProps) => {
    const estimatedFee =
        account !== undefined
            ? getEstimatedFee(
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
            <AmountDetail title="Staked amount" value="0" />
        </>
    );
};

type Props = Omit<Dependencies, 'account' | 'nonce'>;
type UnsafeProps = Partial<Props>;

const hasNecessaryProps = (props: UnsafeProps): props is Props =>
    [props.exchangeRate].every(isDefined);

const withDeps = (component: ComponentType<Props>) =>
    withExchangeRate(
        ensureProps(
            component,
            hasNecessaryProps,
            <MultiSigAccountTransactionFlowLoading title={title} />
        )
    );

export default withDeps(function AddBaker({ exchangeRate }: Props) {
    const accountsInfo = useSelector(accountsInfoSelector);
    const { path: matchedPath } = useRouteMatch();

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const convert = useCallback(
        ({ account }: RequiredValues & RemoveBakerFlowState, nonce: bigint) =>
            convertToTransaction(account, nonce, exchangeRate)(),
        [exchangeRate]
    );

    return (
        <MultiSigAccountTransactionFlow<RemoveBakerFlowState, ConfigureBaker>
            title={title}
            convert={convert}
            preview={DisplayValues}
        >
            {({ account }) => ({
                confirm: {
                    render: (_, onNext) =>
                        isDefined(account) ? (
                            <RemoveBakerPage
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
