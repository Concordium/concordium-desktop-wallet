import React from 'react';
import { Grid } from 'semantic-ui-react';
import MultiSignatureList from '../components/multisig/MultiSignatureList';
import MultisignatureView from '../components/multisig/MultisignatureView';

export default function MultiSignaturePage() {
    return (
        <Grid columns="equal" divided>
            <Grid.Column>
                <MultiSignatureList />
            </Grid.Column>
            <Grid.Column>
                <MultisignatureView />
            </Grid.Column>
        </Grid>
    );
}
