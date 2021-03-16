import React from 'react';
import Columns from '../../components/Columns';
import PageLayout from '../../components/PageLayout';
import MultiSignatureMenuList from './menu/MultiSignatureMenuList';
import MultiSignatureMenuView from './menu/MultiSignatureMenuView';

export default function MultiSignaturePage() {
    return (
        <PageLayout>
            <PageLayout.Header>
                <h1>Multi Signature Transactions</h1>
            </PageLayout.Header>
            <Columns columnScroll divider>
                <Columns.Column verticalPadding>
                    <MultiSignatureMenuList />
                </Columns.Column>
                <Columns.Column verticalPadding>
                    <MultiSignatureMenuView />
                </Columns.Column>
            </Columns>
        </PageLayout>
    );
}
