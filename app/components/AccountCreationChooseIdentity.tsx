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

    function submit() {
        setIdentity(identities[chosenIndex]);
        dispatch(push(routes.ACCOUNTCREATION_GENERATE));
    }

    return (
        <div>
            <h2>Choose Identity</h2>
            <p>bla bla</p>
            <button
                onClick={() => {
                    submit();
                }}
            >
                submit
            </button>
            {identities.map((identity, i) => (
                <IdentityListElement
                    identity={identity}
                    highlighted={i === chosenIndex}
                    index={i}
                    onClick={() => chooseIdentity(i)}
                    key={identity.id}
                />
            ))}
        </div>
    );
}
