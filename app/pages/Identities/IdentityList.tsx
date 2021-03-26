import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import IdentityListElement from '../../components/IdentityListElement';
// import Button from '~/cross-app-components/Button';
import {
    chooseIdentity,
    identitiesSelector,
    chosenIdentitySelector,
} from '../../features/IdentitySlice';
import { Identity } from '../../utils/types';

/**
 * Displays the List of local identities, And allows picking the chosen identity.
 */
export default function IdentityList() {
    const dispatch = useDispatch();
    const identities = useSelector(identitiesSelector);
    const chosenIdentity = useSelector(chosenIdentitySelector);

    return (
        <>
            {identities.map((identity: Identity) => (
                <IdentityListElement
                    identity={identity}
                    key={identity.id}
                    active={chosenIdentity === identity}
                    onClick={() => dispatch(chooseIdentity(identity))}
                />
            ))}
        </>
    );
}
