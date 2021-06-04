import React from 'react';
import MultiSignatureLayout from '~/pages/multisig/MultiSignatureLayout';
import Loading from '~/cross-app-components/Loading';

export default function LoadingComponent() {
    return (
        <MultiSignatureLayout
            pageTitle="Create transfer"
            stepTitle="Transaction Proposal - loading"
        >
            <Loading text="Fetching information from the node" />
        </MultiSignatureLayout>
    );
}
