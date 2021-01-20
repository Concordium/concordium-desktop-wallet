import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import { List, Button } from 'semantic-ui-react';
import styles from './Identity.css';
import routes from '../constants/routes.json';
import IdentityListElement from './IdentityListElement';
import {
    loadIdentities,
    chooseIdentity,
    identitiesSelector,
    chosenIdentitySelector,
} from '../features/IdentitySlice';
import { Identity } from '../utils/types';

export default function IdentityList() {
    const dispatch = useDispatch();
    const identities = useSelector(identitiesSelector);
    const chosenIdentity = useSelector(chosenIdentitySelector);

    useEffect(() => {
        if (!identities) {
            loadIdentities(dispatch);
        }
    }, [dispatch, identities]);

    if (!identities) {
        return null;
    }

    return (
        <>
            <Button onClick={() => dispatch(push(routes.IDENTITYISSUANCE))}>
                +
            </Button>
            <List divided>
                {identities.map((identity: Identity, i: number) => (
                    <List.Item
                        key={identity.id}
                        onClick={() => dispatch(chooseIdentity(i))}
                        className={`${styles.identityListElement} ${
                            chosenIdentity === i
                                ? styles.chosenIdentityListElement
                                : null
                        }`}
                    >
                        <IdentityListElement identity={identity} />
                    </List.Item>
                ))}
            </List>
        </>
    );
}
