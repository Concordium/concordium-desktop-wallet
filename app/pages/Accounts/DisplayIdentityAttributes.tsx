import React from 'react';
import { useSelector } from 'react-redux';
import attributeNamesJson from '../../constants/attributeNames.json';
import { chosenAccountInfoSelector } from '../../features/AccountSlice';
import SidedRow from '~/components/SidedRow';

const attributeNames: Record<string, string> = attributeNamesJson;

/**
 *  DIsplays the revealed Attributes of the chosen account.
 *  TODO: Use local credential to get attributes?
 */
export default function DisplayIdentityAttributes(): JSX.Element | null {
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
            <h3 className="flex justifyCenter">
                This account has no revealed attributes!
            </h3>
        );
    }
    return (
        <>
            {attributeKeys.map((attributeKey: string) => {
                return (
                    <SidedRow
                        key={attributeKey}
                        left={attributeNames[attributeKey]}
                        right={attributes[attributeKey]}
                    />
                );
            })}
        </>
    );
}
