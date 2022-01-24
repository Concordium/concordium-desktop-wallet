/* eslint-disable react/display-name */
import React, { ComponentType } from 'react';
import { Redirect } from 'react-router';
import CommissionsPage from '~/components/Transfers/configureBaker/CommissionsPage';
import DelegationStatusPage from '~/components/Transfers/configureBaker/DelegationStatusPage';
import KeysPage from '~/components/Transfers/configureBaker/KeysPage';
import MetadataUrlPage from '~/components/Transfers/configureBaker/MetadataUrlPage';
import StakePage from '~/components/Transfers/configureBaker/StakePage';
import DisplayBakerCommission from '~/components/Transfers/DisplayBakerCommission';
import DisplayPublicKey from '~/components/Transfers/DisplayPublicKey';
import {
    AddBakerFlowState,
    displayPoolOpen,
    displayRestakeEarnings,
    title,
} from '~/utils/transactionFlows/addBaker';
import {
    Commissions,
    Dependencies,
} from '~/utils/transactionFlows/configureBaker';
import { ConfigureBaker, OpenStatus } from '~/utils/types';
import MultiSigAccountTransactionFlow, {
    MultiSigAccountTransactionFlowLoading,
} from './MultiSigAccountTransactionFlow';
import { AmountDetail, PlainDetail } from './proposal-details/shared';
import routes from '~/constants/routes.json';
import withExchangeRate from '~/components/Transfers/withExchangeRate';
import withChainData from '~/utils/withChainData';
import { ensureProps } from '~/utils/componentHelpers';
import { isDefined } from '~/utils/basicHelpers';

const PLACEHOLDER = 'To be determined';

const DisplayBakerCommissions = ({
    transactionFeeCommission,
    bakingRewardCommission,
    finalizationRewardCommission,
}: Partial<Commissions>) => (
    <>
        <DisplayBakerCommission
            title="Transaction fee commission"
            value={transactionFeeCommission}
            placeholder={PLACEHOLDER}
        />
        <DisplayBakerCommission
            title="Baking reward commission"
            value={bakingRewardCommission}
            placeholder={PLACEHOLDER}
        />
        <DisplayBakerCommission
            title="Finalization reward commission"
            value={finalizationRewardCommission}
            placeholder={PLACEHOLDER}
        />
    </>
);

const toRoot = <Redirect to={routes.MULTISIGTRANSACTIONS_ADD_BAKER} />;

type Props = Omit<Dependencies, 'account' | 'nonce'>;
type UnsafeProps = Partial<Props>;

const hasNecessaryProps = (props: UnsafeProps): props is Props =>
    [props.exchangeRate, props.blockSummary].every(isDefined);

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

export default withDeps(function AddBaker({
    exchangeRate,
    blockSummary,
}: Props) {
    const convert = (): ConfigureBaker => {
        throw new Error('Unimplemented');
    };

    return (
        <MultiSigAccountTransactionFlow<AddBakerFlowState, ConfigureBaker>
            title={title}
            convert={convert}
        >
            {({ openForDelegation, account }) => ({
                stake: {
                    title: 'Stake settings',
                    component: (p) =>
                        account ? (
                            <StakePage
                                {...p}
                                account={account}
                                exchangeRate={exchangeRate}
                                blockSummary={blockSummary}
                            />
                        ) : (
                            toRoot
                        ),
                    view: (v) => (
                        <>
                            <AmountDetail
                                title="Staked amount"
                                value={v?.stake}
                            />
                            <PlainDetail
                                title="Restake earnings"
                                value={
                                    v?.restake !== undefined
                                        ? displayRestakeEarnings(v.restake)
                                        : undefined
                                }
                            />
                        </>
                    ),
                },
                openForDelegation: {
                    title: 'Pool settings',
                    component: DelegationStatusPage,
                    view: (v) => (
                        <PlainDetail
                            title="Pool delegation status"
                            value={
                                v !== undefined ? displayPoolOpen(v) : undefined
                            }
                        />
                    ),
                },
                commissions:
                    openForDelegation === OpenStatus.OpenForAll
                        ? {
                              title: 'Pool settings',
                              component: CommissionsPage,
                              view: (v) => <DisplayBakerCommissions {...v} />,
                          }
                        : undefined,
                metadataUrl:
                    openForDelegation === OpenStatus.OpenForAll
                        ? {
                              title: 'Pool settings',
                              component: MetadataUrlPage,
                              view: (v) => (
                                  <PlainDetail title="Metadata URL" value={v} />
                              ),
                          }
                        : undefined,
                keys: {
                    title: 'Generate keys',
                    component: (p) =>
                        account ? (
                            <KeysPage {...p} account={account} />
                        ) : (
                            toRoot
                        ),
                    view: (v) => (
                        <>
                            <DisplayPublicKey
                                name="Election verify key:"
                                publicKey={v?.electionPublic}
                                placeholder={PLACEHOLDER}
                            />
                            <DisplayPublicKey
                                name="Signature verify key:"
                                publicKey={v?.signaturePublic}
                                placeholder={PLACEHOLDER}
                            />
                            <DisplayPublicKey
                                name="Aggregation verify key:"
                                publicKey={v?.aggregationPublic}
                                placeholder={PLACEHOLDER}
                            />
                        </>
                    ),
                },
            })}
        </MultiSigAccountTransactionFlow>
    );
});
