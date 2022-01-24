/* eslint-disable react/display-name */
import React from 'react';
import DisplayBakerCommission from '~/components/Transfers/DisplayBakerCommission';
import DisplayPublicKey from '~/components/Transfers/DisplayPublicKey';
import {
    AddBakerFlowState,
    displayPoolOpen,
    displayRestakeEarnings,
    title,
} from '~/utils/transactionFlows/addBaker';
import { Commissions } from '~/utils/transactionFlows/configureBaker';
import { ConfigureBaker } from '~/utils/types';
import MultiSigAccountTransactionFlow from './MultiSigAccountTransactionFlow';
import { AmountDetail, PlainDetail } from './proposal-details/shared';

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

export default function AddBaker() {
    const convert = (): ConfigureBaker => {
        throw new Error('Unimplemented');
    };

    return (
        <MultiSigAccountTransactionFlow<AddBakerFlowState, ConfigureBaker>
            title={title}
            convert={convert}
        >
            {({ openForDelegation }) => ({
                stake: {
                    title: 'Stake settings',
                    component: () => null,
                    view: (v) => (
                        <>
                            <AmountDetail
                                title="Staked amount"
                                value={v?.stake}
                            />
                            <PlainDetail
                                title="Restake earnings"
                                value={
                                    v?.restake
                                        ? displayRestakeEarnings(v.restake)
                                        : undefined
                                }
                            />
                        </>
                    ),
                },
                openForDelegation: {
                    title: 'Pool settings',
                    component: () => null,
                    view: (v) => (
                        <PlainDetail
                            title="Pool delegation status"
                            value={
                                v !== undefined ? displayPoolOpen(v) : undefined
                            }
                        />
                    ),
                },
                commissions: openForDelegation
                    ? {
                          title: 'Pool settings',
                          component: () => null,
                          view: (v) => <DisplayBakerCommissions {...v} />,
                      }
                    : undefined,
                metadataUrl: openForDelegation
                    ? {
                          title: 'Pool settings',
                          component: () => null,
                          view: (v) => (
                              <PlainDetail title="Metadata URL" value={v} />
                          ),
                      }
                    : undefined,
                keys: {
                    title: 'Generate keys',
                    component: () => null,
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
}
