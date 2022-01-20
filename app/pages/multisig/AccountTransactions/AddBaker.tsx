/* eslint-disable react/display-name */
import React from 'react';
import { AddBakerFlowState, title } from '~/utils/transactionFlows/addBaker';
import { ConfigureBaker } from '~/utils/types';
import MultiSigAccountTransactionFlow from './MultiSigAccountTransactionFlow';

export default function AddBaker() {
    const convert = (): ConfigureBaker => {
        throw new Error('Unimplemented');
    };

    return (
        <MultiSigAccountTransactionFlow<AddBakerFlowState, ConfigureBaker>
            title={title}
            convert={convert}
        >
            {{
                stake: {
                    title: 'Stake settings',
                    component: () => null,
                    view: (v) => <>{JSON.stringify(v)}</>,
                },
                openForDelegation: {
                    title: 'Pool settings',
                    component: () => null,
                    view: (v) => <>{JSON.stringify(v)}</>,
                },
                commissions: {
                    title: 'Pool settings',
                    component: () => null,
                    view: (v) => <>{JSON.stringify(v)}</>,
                },
                metadataUrl: {
                    title: 'Pool settings',
                    component: () => null,
                    view: (v) => <>{JSON.stringify(v)}</>,
                },
                keys: {
                    title: 'Generate keys',
                    component: () => null,
                    view: (v) => <>{JSON.stringify(v)}</>,
                },
            }}
        </MultiSigAccountTransactionFlow>
    );
}
