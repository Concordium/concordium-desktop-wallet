import React from 'react';
import { useSelector } from 'react-redux';
import {
    identitiesSelector,
    chosenIdentitySelector,
} from '../features/IdentitySlice';
import { Identity, IdentityObject } from '../utils/types';
import styles from './Identity.css';

export default function IdentityView() {
    const identities: Identity[] = useSelector(identitiesSelector);
    const chosenIndex = useSelector(chosenIdentitySelector);

    if (chosenIndex === undefined || chosenIndex >= identities.length) {
        return <div />;
    }

    const identity: Identity = identities[chosenIndex];
    const identityObject: IdentityObject = JSON.parse(identity.identityObject)
        .value;

    return (
        <div className={styles.halfPage}>
            <div className={styles.identityListElement}>
                <h1 className={styles.name}>{identity.name}</h1>

                <ul>
                    <li>
                        Country of residence -{' '}
                        {
                            identityObject.attributeList.chosenAttributes
                                .countryOfResidence
                        }
                    </li>
                    <li>
                        Date of birth -{' '}
                        {identityObject.attributeList.chosenAttributes.dob}
                    </li>
                    <li>
                        First name -{' '}
                        {
                            identityObject.attributeList.chosenAttributes
                                .firstName
                        }
                    </li>
                    <li>
                        ID valid to - {identityObject.attributeList.validTo}
                    </li>
                    <li>
                        ID valid from - {identityObject.attributeList.createdAt}
                    </li>
                    <li>
                        Identity document issuer -{' '}
                        {
                            identityObject.attributeList.chosenAttributes
                                .idDocIssuer
                        }
                    </li>
                    <li>
                        Identity document number -{' '}
                        {identityObject.attributeList.chosenAttributes.idDocNo}
                    </li>
                    <li>
                        Identity document type -{' '}
                        {
                            identityObject.attributeList.chosenAttributes
                                .idDocType
                        }
                    </li>
                    <li>
                        Last name -{' '}
                        {identityObject.attributeList.chosenAttributes.lastName}
                    </li>
                    <li>
                        National ID number -{' '}
                        {
                            identityObject.attributeList.chosenAttributes
                                .nationalIdNo
                        }
                    </li>
                    <li>
                        Country of nationality -{' '}
                        {
                            identityObject.attributeList.chosenAttributes
                                .nationality
                        }
                    </li>
                    <li>
                        Sex -{' '}
                        {identityObject.attributeList.chosenAttributes.sex}
                    </li>
                    <li>
                        Tax ID number -{' '}
                        {identityObject.attributeList.chosenAttributes.taxIdNo}
                    </li>
                </ul>
            </div>
        </div>
    );
}
