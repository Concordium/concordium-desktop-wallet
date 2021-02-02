import React from 'react';
import { useSelector } from 'react-redux';
import { List, Grid } from 'semantic-ui-react';
import { chosenIdentitySelector } from '../features/IdentitySlice';
import IdentityListElement from './IdentityListElement';
import { IdentityObject, IdentityStatus } from '../utils/types';
import attributeNames from '../constants/attributeNames.json';

/**
 * Detailed view of the chosen identity.
 */
export default function IdentityView() {
    const identity = useSelector(chosenIdentitySelector);

    if (identity === undefined) {
        return null;
    }

    if (identity.status !== IdentityStatus.Confirmed) {
        return (
            <List centered>
                <IdentityListElement identity={identity} />
            </List>
        );
    }

    const identityObject: IdentityObject = JSON.parse(identity.identityObject)
        .value;

    return (
        <List centered>
            <IdentityListElement identity={identity} />
            <Grid container columns={2} divided="vertically">
                {Object.keys(identityObject.attributeList.chosenAttributes).map(
                    (attribute: string) => (
                        <Grid.Row key={attribute}>
                            <Grid.Column textAlign="left">
                                {attributeNames[attribute]}
                            </Grid.Column>
                            <Grid.Column textAlign="right">
                                {
                                    identityObject.attributeList
                                        .chosenAttributes[attribute]
                                }
                            </Grid.Column>
                        </Grid.Row>
                    )
                )}
            </Grid>
        </List>
    );
}
