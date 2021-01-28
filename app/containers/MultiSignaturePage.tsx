import React from 'react';
import { Grid } from 'semantic-ui-react';
import MultiSignatureMenuList from '../components/multisig/MultiSignatureMenuList';
import MultiSignatureMenuView from '../components/multisig/MultiSignatureMenuView';

export default function MultiSignaturePage() {
    return (
        <Grid columns="equal" divided>
            <Grid.Column>
                <MultiSignatureMenuList />
            </Grid.Column>
            <Grid.Column>
                <MultiSignatureMenuView />
            </Grid.Column>
        </Grid>
    );
}
