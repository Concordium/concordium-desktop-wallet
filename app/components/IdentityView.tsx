import React from 'react';
import { useSelector } from 'react-redux';
import {
    identitiesSelector,
    chosenIdentitySelector,
} from '../features/IdentitySlice';
import IdentityListElement from './IdentityListElement';
import { Identity, IdentityObject } from '../utils/types';
import styles from './Identity.css';
import transactionStyles from './Transaction.css';
import SidedText from './SidedText';
import attributeNames from '../constants/attributeNames.json';

export default function IdentityView() {
    const identities: Identity[] = useSelector(identitiesSelector);
    const chosenIndex = useSelector(chosenIdentitySelector);

    if (identities === undefined || chosenIndex === undefined) {
        return <div />;
    }

    const identity: Identity = identities[chosenIndex];

    if (identity.status !== 'confirmed') {
        return (
            <div className={styles.halfPage}>
                <h1 className={styles.name}>{identity.name}</h1>
            </div>
        );
    }

    const identityObject: IdentityObject = JSON.parse(identity.identityObject)
        .value;

    return (
        <div className={styles.halfPage}>
            <div className={transactionStyles.transactionBox}>
                <IdentityListElement
                    identity={identity}
                    onClick={() => {}}
                    highlighted
                    index={0}
                />
                {Object.keys(identityObject.attributeList.chosenAttributes).map(
                    (attribute) => (
                        <SidedText
                            key={attribute}
                            left={attributeNames[attribute]}
                            right={
                                identityObject.attributeList.chosenAttributes[
                                    attribute
                                ]
                            }
                        />
                    )
                )}
            </div>
        </div>
    );
}
