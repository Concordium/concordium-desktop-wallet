import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import { Button, Menu } from 'semantic-ui-react';
import routes from '../../constants/routes.json';
import IdentityListElement from '../../components/IdentityListElement';
import {
    chooseIdentity,
    identitiesSelector,
    chosenIdentitySelector,
} from '../../features/IdentitySlice';
import { Identity } from '../../utils/types';

/**
 * Displays the List of local identities, And allows picking the chosen identity.
 * TODO: move the "IdentityIssuance start button"?
 */
export default function IdentityList() {
    const dispatch = useDispatch();
    const identities = useSelector(identitiesSelector);
    const chosenIdentity = useSelector(chosenIdentitySelector);

    return (
        <>
            <Button onClick={() => dispatch(push(routes.IDENTITYISSUANCE))}>
                +
            </Button>
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
        </>
    );
}
