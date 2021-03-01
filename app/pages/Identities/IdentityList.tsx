import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Menu } from 'semantic-ui-react';
import IdentityListElement from '../../components/IdentityListElement';
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
        <Menu vertical fluid>
            {identities.map((identity: Identity) => (
                <Menu.Item
                    key={identity.id}
                    onClick={() => dispatch(chooseIdentity(identity))}
                    active={chosenIdentity === identity}
                >
                    <IdentityListElement identity={identity} />
                </Menu.Item>
            ))}
        </Menu>
    );
}
