import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import { identitiesSelector } from '../features/accountsSlice';
import routes from '../constants/routes.json';
import identityListElement from './IdentityListElement';

export default function AccountCreationChooseIdentity(setIndex): JSX.Element {
    const [chosenIndex, chooseIdentity] = useState(0);
    const dispatch = useDispatch();
    const identities = useSelector(identitiesSelector);

    function submit() {
        setIndex(chosenIndex);
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
            {identities.map((identity, i) =>
                identityListElement(
                    identity,
                    () => chooseIdentity(i),
                    i === chosenIndex
                )
            )}
        </div>
    );
}
