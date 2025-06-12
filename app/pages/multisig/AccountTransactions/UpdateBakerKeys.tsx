/* eslint-disable react/display-name */
import React, { ComponentType, useCallback } from 'react';
import { Redirect, useRouteMatch } from 'react-router';
import { isBakerAccount } from '@concordium/web-sdk';
import { ConfigureBaker, Fraction } from '~/utils/types';
import MultiSigAccountTransactionFlow, {
    MultiSigAccountTransactionFlowLoading,
    RequiredValues,
} from './MultiSigAccountTransactionFlow';
import withExchangeRate from '~/components/Transfers/withExchangeRate';
import { ensureProps } from '~/utils/componentHelpers';
import { isDefined } from '~/utils/basicHelpers';
import { convertToBakerTransaction } from '~/utils/transactionFlows/configureBaker';
import DisplayEstimatedFee from '~/components/DisplayEstimatedFee';
import {
    getEstimatedUpdateBakerKeysFee,
    UpdateBakerKeysDependencies,
    UpdateBakerKeysFlowState,
    updateBakerKeysTitle,
} from '~/utils/transactionFlows/updateBakerKeys';
import KeysPage from '~/components/Transfers/configureBaker/KeysPage';
import DisplayPublicKey from '~/components/Transfers/DisplayPublicKey';

import displayTransferStyles from '~/components/Transfers/transferDetails.module.scss';

interface DisplayProps
    extends Partial<RequiredValues & UpdateBakerKeysFlowState> {
    exchangeRate: Fraction;
}
const DisplayValues = ({ account, exchangeRate, keys }: DisplayProps) => {
    const estimatedFee =
        account !== undefined
            ? getEstimatedUpdateBakerKeysFee(
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
            <DisplayPublicKey
                name="Election verify key:"
                publicKey={keys?.electionPublic}
                placeholder
            />
            <DisplayPublicKey
                name="Signature verify key:"
                publicKey={keys?.signaturePublic}
                placeholder
            />
            <DisplayPublicKey
                name="Aggregation verify key:"
                publicKey={keys?.aggregationPublic}
                placeholder
            />
        </>
    );
};

type Props = UpdateBakerKeysDependencies;
type UnsafeProps = Partial<Props>;

const hasNecessaryProps = (props: UnsafeProps): props is Props =>
    [props.exchangeRate].every(isDefined);

const withDeps = (component: ComponentType<Props>) =>
    withExchangeRate(
        ensureProps(
            component,
            hasNecessaryProps,
            <MultiSigAccountTransactionFlowLoading
                title={updateBakerKeysTitle}
            />
        )
    );

export default withDeps(function UpdateBakerKeys({ exchangeRate }: Props) {
    const { path: matchedPath } = useRouteMatch();

    const convert = useCallback(
        (
            { account, ...values }: RequiredValues & UpdateBakerKeysFlowState,
            nonce: bigint
        ) =>
            convertToBakerTransaction(
                account,
                nonce,
                exchangeRate
            )(values, values.expiry),
        [exchangeRate]
    );

    return (
        <MultiSigAccountTransactionFlow<
            UpdateBakerKeysFlowState,
            ConfigureBaker
        >
            title={updateBakerKeysTitle}
            convert={convert}
            accountFilter={(_, i) => isDefined(i) && isBakerAccount(i)}
            preview={(values) => (
                <DisplayValues {...values} exchangeRate={exchangeRate} />
            )}
        >
            {({ account }) => ({
                keys: {
                    title: 'Generated keys',
                    render: (initial, onNext) =>
                        isDefined(account) ? (
                            <KeysPage
                                account={account}
                                initial={initial}
                                onNext={onNext}
                            />
                        ) : (
                            <Redirect to={matchedPath} />
                        ),
                },
            })}
        </MultiSigAccountTransactionFlow>
    );
});
