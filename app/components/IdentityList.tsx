import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    chooseIdentity,
    identitiesSelector,
    chosenIdentitySelector,
} from '../features/accountsSlice';
import styles from './Accounts.css';

export default function IdentityList() {
    const dispatch = useDispatch();
    const identities = useSelector(identitiesSelector);
    const chosenIndex = useSelector(chosenIdentitySelector);

    return (
        <div className={styles.halfPage}>
            {identities.map((identity, i) => (
                <div
                    onClick={() => dispatch(chooseIdentity(i))}
                    key={identity.name}
                    className={`${styles.accountListElement} ${
                        i === chosenIndex
                            ? styles.chosenAccountListElement
                            : null
                    }`}
                >
                    {identity.name}
                </div>
            ))}
        </div>
    );
}
