import React from 'react';
import PageLayout from '~/components/PageLayout';
import Columns from '~/components/Columns';
import Export from './Export';
import Import from './Import';

export default function ExportImportPage() {
    return (
        <PageLayout>
            <PageLayout.Header>
                <h1>Export and Import</h1>
            </PageLayout.Header>
            <PageLayout.Container disableBack>
                <Columns divider columnScroll>
                    <Columns.Column>
                        <Export />
                    </Columns.Column>
                    <Columns.Column>
                        <Import />
                    </Columns.Column>
                </Columns>
            </PageLayout.Container>
        </PageLayout>
    );
}
