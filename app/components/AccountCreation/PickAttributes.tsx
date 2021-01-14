import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import routes from '../../constants/routes.json';
import { Identity } from '../../utils/types';
import IdentityListElement from '../IdentityListElement';
import styles from './AccountCreation.css';

interface Props {
    identity: Identity;
    setChosenAttributes: (attributes: string[]) => void;
}
export default function AccountCreationPickAttributes({
    identity,
    setChosenAttributes,
}: Props): JSX.Element {
    const dispatch = useDispatch();
    const [attributes, setAttributes] = useState([]);

    useEffect(() => {
        const identityAttributes = JSON.parse(identity.identityObject).value
            .attributeList.chosenAttributes;
        setAttributes(
            Object.entries(identityAttributes).map(([tag, value]) => ({
                tag,
                value,
                isChecked: false,
            }))
        );
    }, [identity]);

    function submit() {
        const attributeObject = [];
        attributes
            .filter((x) => x.isChecked)
            .forEach(({ tag }) => attributeObject.push(tag));
        setChosenAttributes(attributeObject);
        dispatch(push(routes.ACCOUNTCREATION_GENERATE));
    }

    return (
        <div className={styles.splitPage}>
            <div className={styles.pickAttributesLeftSide}>
                <h2>Choose which attributes to reveal</h2>
                <p>
                    On the right you can choose which attributes you want to
                    reveal on your account. You can choose however many you
                    want, including none. Which attributes do you want to
                    reveal?
                </p>
                <button
                    type="button"
                    onClick={() => {
                        submit();
                    }}
                >
                    Submit with revealed attributes
                </button>
            </div>
            <div className={styles.pickAttributesRightSide}>
                <IdentityListElement
                    identity={identity}
                    highlighted
                    index={0}
                />
                {attributes.map((attribute, i) => (
                    <div
                        className={styles.AttributeItem}
                        key={attribute.tag}
                        onClick={() => {
                            // TODO: find better way?
                            const newAttributes = [...attributes];
                            newAttributes[i].isChecked = !newAttributes[i]
                                .isChecked;
                            setAttributes(newAttributes);
                        }}
                    >
                        <input checked={attribute.isChecked} type="checkbox" />
                        <p>
                            {attribute.tag}: {attribute.value}{' '}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
