import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import {
    loadIdentities,
    identitiesSelector,
} from '../../features/IdentitySlice';
import routes from '../../constants/routes.json';
import IdentityListElement from '../IdentityListElement';
import { Identity } from '../../utils/types';

interface Props {
    setIdentity: (identity: Identity) => void;
}

export default function AccountCreationPickIdentity({
    setIdentity,
}: Props): JSX.Element {
    const [chosenIndex, chooseIdentity] = useState(0);
    const dispatch = useDispatch();
    const identities = useSelector(identitiesSelector);

    useEffect(() => {
        if (!identities) {
            loadIdentities(dispatch);
        }
    }, [dispatch, identities]);

    if (!identities) {
        return null;
    }

    function submit(route) {
        setIdentity(identities[chosenIndex]);
        dispatch(push(route));
    }

    return (
        <div>
            <h2>Choose an identity</h2>
            <p>
                The next step is to choose what identity to use, for creating
                your new account. Besides choosing your identity, you must
                decide whether to reveal any attributes on the account, and how
                many. Besides deciding on an identity, you can decide to reveal
                a number of attributes on your account, though this is not
                necessary. Which identity do you want to use?
            </p>
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
                type="button"
                disabled={identities[chosenIndex].identityObject == null}
                onClick={() => {
                    submit(routes.ACCOUNTCREATION_PICKATTRIBUTES);
                }}
            >
                Choose attributes to reveal
            </button>
            <button
                type="button"
                onClick={() => {
                    submit(routes.ACCOUNTCREATION_GENERATE);
                }}
            >
                Continue without revealing attributes
            </button>
        </div>
    );
}
