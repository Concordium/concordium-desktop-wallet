import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import CardList from '~/cross-app-components/CardList';
import IdentityCard from '../../components/IdentityCard';
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
        <CardList>
            {identities.map((identity: Identity) => (
                <IdentityCard
                    identity={identity}
                    key={identity.id}
                    active={chosenIdentity === identity}
                    onClick={() => dispatch(chooseIdentity(identity))}
                />
            ))}
        </CardList>
    );
}
