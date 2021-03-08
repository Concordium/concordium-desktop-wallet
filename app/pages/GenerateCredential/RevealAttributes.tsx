import React, { useState } from 'react';
import { Card, Checkbox } from 'semantic-ui-react';
import { Identity, IdentityObject } from '../../utils/types';

interface Props {
    setChosenAttributes: (attributes: string[]) => void;
    identity: Identity | undefined;
}

interface Attribute {
    tag: string;
    value: string;
    isChecked: boolean;
}

// The entrance into the flow is the last Route (which should have no path), otherwise the flow is controlled by the components themselves
export default function PickAccount({
    setChosenAttributes,
    identity,
}: Props): JSX.Element {
    if (!identity) {
        throw new Error('unexpected missing identity');
    }

    const [attributes, setAttributes] = useState(() => {
        const identityObject: IdentityObject = JSON.parse(
            identity.identityObject
        ).value;
        const identityAttributes =
            identityObject.attributeList.chosenAttributes;
        const attributeElements = Object.entries(identityAttributes).map(
            ([tag, value]) => ({
                tag,
                value,
                isChecked: false,
            })
        );
        return attributeElements;
    });

    function submitAttributes(newAttributes: Attribute[]) {
        const chosenAttributes: string[] = [];
        newAttributes
            .filter((x) => x.isChecked)
            .forEach(({ tag }) => chosenAttributes.push(tag));
        setChosenAttributes(chosenAttributes);
    }

    return (
        <Card centered>
            {attributes.map((attribute, i) => (
                <Checkbox
                    key={attribute.tag}
                    checked={attribute.isChecked}
                    label={`${attribute.tag}: ${attribute.value}`}
                    onClick={() => {
                        // TODO: find better way?
                        const newAttributes = [...attributes];
                        newAttributes[i].isChecked = !newAttributes[i]
                            .isChecked;
                        setAttributes(newAttributes);
                        submitAttributes(newAttributes);
                    }}
                />
            ))}
        </Card>
    );
}
