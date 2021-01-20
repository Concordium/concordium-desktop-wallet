import React from 'react';
import { Grid } from 'semantic-ui-react';
import CopyButton from './CopyButton';

interface Props {
    title: string;
    value: string;
    note?: string;
}

function CopiableListElement({ title, value, note }: Props): JSX.element {
    return (
        <Grid container columns={2} divided="vertically">
            <Grid.Row>
                <Grid.Column textAlign="left">
                    {title} {' \n'}
                    {value} {note ? `(${note})` : undefined}
                </Grid.Column>
                <Grid.Column textAlign="right">
                    <CopyButton value={value} />
                </Grid.Column>
            </Grid.Row>
        </Grid>
    );
}

CopiableListElement.defaultProps = {
    note: undefined,
};

export default CopiableListElement;
