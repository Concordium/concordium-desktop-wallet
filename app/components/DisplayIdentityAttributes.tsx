import React from 'react';
import { useSelector } from 'react-redux';
import { Grid, Header } from 'semantic-ui-react';
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
    const attributeKeys = Object.keys(attributes);

    if (attributeKeys.length === 0) {
        return (
            <Header textAlign="center">
                This account has no revealed attributes!
            </Header>
        );
    }
    return (
        <Grid container columns={2} divided="vertically">
            {attributeKeys.map((attributeKey: string) => (
                <SidedText
                    key={attributeKey}
                    left={attributeNames[attributeKey]}
                    right={attributes[attributeKey]}
                />
            ))}
        </Grid>
    );
}
