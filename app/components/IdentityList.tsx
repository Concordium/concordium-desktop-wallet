import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { identitiesSelector, loadIdentities, chooseIdentity, chosenIdentitySelector } from '../features/IdentitySlice';
import styles from './Identity.css';

export default function IdentityList() {
    
    const dispatch = useDispatch();
    const identities = useSelector(identitiesSelector);
    const chosenIndex = useSelector(chosenIdentitySelector);

    useEffect(() => {
        if (identities.length === 0) {
            loadIdentities(dispatch);
        }
    }, [dispatch]);

    return (
        <div className={styles.halfPage}>
            {identities.map((identity, i) => (

                <div
                    onClick={() => dispatch(chooseIdentity(i))}
                    className={`${styles.identityListElement} ${i === chosenIndex ? styles.chosenIdentityListElement : null}`}
                    key={i}
                >
                    {identity.name}
                </div>
            ))}
        </div>
    );
}
