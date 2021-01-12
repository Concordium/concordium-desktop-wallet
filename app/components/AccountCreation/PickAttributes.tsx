import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import routes from '../../constants/routes.json';
import { Identity } from '../../utils/types';

interface Props {
    identity: Identity;
    setRevealedAttributes: (attrivutes: string[]) => void;
}

export default function AccountCreationPickAttributes({
    identity,
    setRevealedAttributes,
}: Props): JSX.Element {
    const dispatch = useDispatch();
    const [attributes, setAttributes] = useState([]);

    useEffect(() => {
        const idObject = JSON.parse(identity.identityObject).value;
        setAttributes(
            Object.keys(idObject.attributeList.chosenAttributes).map((tag) => ({
                tag,
                value: idObject.attributeList.chosenAttributes[tag],
                isChecked: false,
            }))
        );
    }, [identity]);

    function submit() {
        const attributeObject = [];
        attributes
            .filter((x) => x.isChecked)
            .forEach(({ tag }) => attributeObject.push(tag));
        setRevealedAttributes(attributeObject);
        dispatch(push(routes.ACCOUNTCREATION_GENERATE));
    }

    return (
        <div>
            <h2>Pick Attributes to reveal</h2>
            {attributes.map((attribute, i) => (
                <div
                    key={attribute.tag}
                    onClick={() => {
                        // TODO: find better way?
                        const newAttributes = [...attributes];
                        newAttributes[i].isChecked = !newAttributes[i]
                            .isChecked;
                        setAttributes(newAttributes);
                    }}
                >
                    <p>
                        {' '}
                        {attribute.isChecked ? '!' : '_'} {attribute.tag}:{' '}
                        {attribute.value}{' '}
                    </p>
                </div>
            ))}
            <button
                type="submit"
                onClick={() => {
                    submit();
                }}
            >
                submit
            </button>
        </div>
    );
}
