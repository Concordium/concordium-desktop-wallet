import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import {
    chooseIdentity,
    identitiesSelector,
    chosenIdentitySelector,
    loadIdentities,
} from '../features/accountsSlice';
import routes from '../constants/routes.json';
import identityListElement from './IdentityListElement';

import styles from './Accounts.css';

export default function IdentityList() {
    const dispatch = useDispatch();
    const identities = useSelector(identitiesSelector);
    const chosenIndex = useSelector(chosenIdentitySelector);

    useEffect(() => {
        loadIdentities(dispatch);
    }, [dispatch]);

    return (
        <div className={styles.halfPage}>
            <Link to={routes.IDENTITYISSUANCE}>
                <button>x</button>
            </Link>

            {identities.map((identity, i) =>
                identityListElement(
                    identity,
                    () => dispatch(chooseIdentity(i)),
                    i === chosenIndex
                )
            )}
        </div>
    );
}
