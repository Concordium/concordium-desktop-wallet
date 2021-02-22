import React from 'react';
import { Grid } from 'semantic-ui-react';

interface Props {
    left: string | JSX.Element;
    right: string | JSX.Element;
    onClick?(e: Event): void;
}

/**
 * Helper component to display two children in a grid,
 * each aligned by their respective side.
 */
function sidedRow({ left, right, onClick }: Props) {
    return (
        <Grid.Row onClick={onClick}>
            <Grid.Column textAlign="left">{left}</Grid.Column>
            <Grid.Column textAlign="right">{right}</Grid.Column>
        </Grid.Row>
    );
}

sidedRow.defaultProps = {
    onClick: () => {},
};

export default sidedRow;
