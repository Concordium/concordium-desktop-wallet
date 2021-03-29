import React from 'react';
import PageLayout from '~/components/PageLayout';
import MultiSignatureMenu from './MultiSignatureMenu';

export default function MultiSignaturePage() {
    return (
        <PageLayout>
            <PageLayout.Header>
                <h1>Multi Signature Transactions</h1>
            </PageLayout.Header>
            <MultiSignatureMenu />
        </PageLayout>
    );
}
