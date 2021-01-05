import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import { loadIdentities, identitiesSelector } from '../features/IdentitySlice';
import routes from '../constants/routes.json';
import IdentityListElement from './IdentityListElement';

export default function AccountCreationChooseIdentity(
    setIdentity
): JSX.Element {
    const [chosenIndex, chooseIdentity] = useState(0);
    const dispatch = useDispatch();
    const identities = useSelector(identitiesSelector);

    useEffect(() => {
        if (!identities) {
            loadIdentities(dispatch);
        }
    }, [dispatch, identities]);

    if (!identities) {
        return <div />;
    }

    function submit(route) {
        setIdentity(identities[chosenIndex]);
        dispatch(push(route));
    }

    return (
        <div>
            <h2>Choose Identity</h2>
            <p>bla bla</p>
            {identities.map((identity, i) => (
                <IdentityListElement
                    identity={identity}
                    highlighted={i === chosenIndex}
                    index={i}
                    onClick={() => chooseIdentity(i)}
                    key={identity.id}
                />
            ))}
            <button
                disabled={identities[chosenIndex].identityObject == null}
                onClick={() => {
                    submit(routes.ACCOUNTCREATION_PICK_ATTRIBUTES);
                }}
            >
                Choose attributes to reveal
            </button>
            <button
                onClick={() => {
                    submit(routes.ACCOUNTCREATION_GENERATE);
                }}
            >
                Continue without revealing attributes
            </button>
        </div>
    );
}
