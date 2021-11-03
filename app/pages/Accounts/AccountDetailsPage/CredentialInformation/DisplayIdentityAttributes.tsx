import React from 'react';
import attributeNamesJson from '~/constants/attributeNames.json';
import SidedRow from '~/components/SidedRow';
import { AttributeKeyName, CredentialDeploymentValues } from '~/utils/types';
import {
    formatAttributeValue,
    compareAttributes,
} from '~/utils/identityHelpers';

const attributeNames: Record<string, string> = attributeNamesJson;

interface Props {
    credential: CredentialDeploymentValues;
}

/**
 *  DIsplays the revealed Attributes of the chosen account.
 *  TODO: Use local credential to get attributes?
 */
export default function DisplayIdentityAttributes({
    credential,
}: Props): JSX.Element | null {
    const attributes = credential.policy.revealedAttributes;
    const attributeKeys = Object.keys(attributes);

    if (attributeKeys.length === 0) {
        return (
            <div className="pT10" key={credential.credId || credential.regId}>
                This credential has no identity data revealed
            </div>
        );
    }
    return (
        <>
            {attributeKeys
                .map((k) => k as AttributeKeyName)
                .sort(compareAttributes)
                .map((attributeKey: AttributeKeyName) => (
                    <SidedRow
                        className="pT10"
                        key={attributeKey}
                        left={attributeNames[attributeKey]}
                        right={formatAttributeValue(
                            attributeKey,
                            attributes[attributeKey]
                        )}
                    />
                ))}
        </>
    );
}
