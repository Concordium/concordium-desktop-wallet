import React from 'react';
import { Grid } from 'semantic-ui-react';
import PageLayout from '../../components/PageLayout';
import MultiSignatureMenuList from './MultiSignatureMenuList';
import MultiSignatureMenuView from './MultiSignatureMenuView';

export default function MultiSignaturePage() {
    return (
        <PageLayout>
            <PageLayout.Header>
                <h1>Multi Signature Transactions</h1>
            </PageLayout.Header>
            <Grid columns="equal" divided>
                <Grid.Column>
                    <MultiSignatureMenuList />
                </Grid.Column>
                <Grid.Column>
                    <MultiSignatureMenuView />
                </Grid.Column>
            </Grid>
        </PageLayout>
    );
}
