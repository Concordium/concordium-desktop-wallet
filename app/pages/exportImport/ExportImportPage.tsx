import React from 'react';
import { Grid, Segment } from 'semantic-ui-react';
import Export from './Export';
import Import from './Import';
import PageHeader from '../../components/PageHeader';

export default function ExportImportPage() {
    return (
        <>
            <PageHeader>
                <h1>Export and Import</h1>
            </PageHeader>
            <Segment>
                <Grid centered columns="equal" divided>
                    <Grid.Row>
                        <Grid.Column>
                            <Export />
                        </Grid.Column>
                        <Grid.Column>
                            <Import />
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </Segment>
        </>
    );
}
