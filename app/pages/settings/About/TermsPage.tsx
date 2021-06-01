import React from 'react';
import PageLayout from '~/components/PageLayout';
import Button from '~/cross-app-components/Button';

interface Props {
    /**
     * Defaults to false, resulting in accept button not being shown.
     */
    mustAccept?: boolean;
}

export default function TermsPage({ mustAccept = false }: Props): JSX.Element {
    return (
        <PageLayout>
            <PageLayout.Header>
                <h1>Terms & Conditions</h1>
            </PageLayout.Header>
            <PageLayout.Container>
                {mustAccept && <Button>I accept the terms</Button>}
            </PageLayout.Container>
        </PageLayout>
    );
}
