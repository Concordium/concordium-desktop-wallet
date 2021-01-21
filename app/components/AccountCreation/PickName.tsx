import React, { useState } from 'react';
import { push } from 'connected-react-router';
import { useDispatch } from 'react-redux';
import styles from '../Styling.css';
import routes from '../../constants/routes.json';

interface Props {
    setAccountName: (name: string) => void;
}

// TODO: add Validation check on the name.
export default function IdentityIssuancePickName({
    setAccountName,
}: Props): JSX.Element {
    const [name, setName] = useState('');
    const dispatch = useDispatch();

    function submit() {
        setAccountName(name);
        dispatch(push(routes.ACCOUNTCREATION_PICKIDENTITY));
    }

    return (
        <div>
            <h2>Naming your new account</h2>
            <p>
                The first step of creating a new account, is giving it a name.
            </p>
            <p>What would you like to name your account?</p>
            <span className={styles.modalElement}>
                <input
                    name="name"
                    className={styles.input}
                    placeholder="Account name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    data-tid="hashInput"
                />
            </span>
            <button
                type="button"
                onClick={() => {
                    submit();
                }}
            >
                Next
            </button>
        </div>
    );
}
