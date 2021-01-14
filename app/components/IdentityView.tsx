import React from 'react';
import { useSelector } from 'react-redux';
import { chosenIdentitySelector } from '../features/IdentitySlice';
import IdentityListElement from './IdentityListElement';
import { Identity, IdentityObject, IdentityStatus } from '../utils/types';
import styles from './Identity.css';
import transactionStyles from './Transaction.css';
import SidedText from './SidedText';
import attributeNames from '../constants/attributeNames.json';

export default function IdentityView() {
    const identity = useSelector(chosenIdentitySelector);

    if (identity === undefined) {
        return null;
    }

    if (identity.status !== IdentityStatus.confimed) {
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
