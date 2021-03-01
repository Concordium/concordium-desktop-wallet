import React from 'react';
import { Grid } from 'semantic-ui-react';
import MultiSignatureMenuList from './MultiSignatureMenuList';
import MultiSignatureMenuView from './MultiSignatureMenuView';
import PageHeader from '../../components/PageHeader';

export default function MultiSignaturePage() {
    return (
        <>
            <PageHeader>
                <h1>Multi Signature Transactions</h1>
            </PageHeader>
            <Grid columns="equal" divided>
                <Grid.Column>
                    <MultiSignatureMenuList />
                </Grid.Column>
                <Grid.Column>
                    <MultiSignatureMenuView />
                </Grid.Column>
            </Grid>
        </>
    );
}
