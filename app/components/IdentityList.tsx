import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    identitiesSelector,
    loadIdentities,
    chooseIdentity,
    chosenIdentitySelector,
} from '../features/IdentitySlice';
import { Identity } from '../utils/types';
import styles from './Identity.css';

export default function IdentityList() {
    const dispatch = useDispatch();
    const identities = useSelector(identitiesSelector);
    const chosenIndex = useSelector(chosenIdentitySelector);

    useEffect(() => {
        if (identities.length === 0) {
            loadIdentities(dispatch);
        }
    }, [dispatch, identities.length]);

    return (
        <div className={styles.halfPage}>
            {identities.map((identity: Identity, i) => (
                <div
                    role="button"
                    tabIndex={i}
                    onClick={() => dispatch(chooseIdentity(i))}
                    className={`${styles.identityListElement} ${
                        i === chosenIndex
                            ? styles.chosenIdentityListElement
                            : null
                    }`}
                    key={identity.id}
                >
                    <h1 className={styles.name}>{identity.name}</h1>
                </div>
            ))}
        </div>
    );
}
