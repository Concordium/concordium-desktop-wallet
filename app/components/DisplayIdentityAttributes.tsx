import React from 'react';
import { useSelector } from 'react-redux';
import { Grid } from 'semantic-ui-react';
import attributeNames from '../constants/attributeNames.json';
import { chosenAccountInfoSelector } from '../features/AccountSlice';
import SidedText from './SidedText';

/**
 *  DIsplays the revealed Attributes of the chosen account.
 *  TODO: Use local credential to get attributes?
 */
export default function DisplayIdentityAttributes(): JSX.element {
    const accountInfo = useSelector(chosenAccountInfoSelector);

    if (!accountInfo) {
        return null;
    }

    const attributes =
        accountInfo.accountCredentials[0].value.contents.policy
            .revealedAttributes;
    return (
        <Grid container columns={2} divided="vertically">
            {Object.keys(attributes).map((attribute: string) => (
                <SidedText
                    key={attribute}
                    left={attributeNames[attribute]}
                    right={attributes[attribute]}
                />
            ))}
        </Grid>
    );
}
