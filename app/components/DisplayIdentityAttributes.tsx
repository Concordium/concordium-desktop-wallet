import React from 'react';
import { useSelector } from 'react-redux';
import attributeNames from '../constants/attributeNames.json';
import { chosenAccountInfoSelector } from '../features/AccountSlice';
import SidedText from './SidedText';

export default function DisplayIdentityAttributes(): JSX.element {
    const accountInfo = useSelector(chosenAccountInfoSelector);

    if (!accountInfo) {
        return <div />;
    }

    const attributes =
        accountInfo.accountCredentials[0].value.contents.policy
            .revealedAttributes;
    return (
        <>
            {Object.keys(attributes).map((attribute: string) => (
                <SidedText
                    key={attribute}
                    left={attributeNames[attribute]}
                    right={attributes[attribute]}
                />
            ))}
        </>
    );
}
