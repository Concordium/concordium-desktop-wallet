import React, { useState } from 'react';
import { push } from 'connected-react-router';
import { useDispatch } from 'react-redux';
import styles from '../Styling.css';
import routes from '../../constants/routes.json';

interface Props {
    setAccountName: (name: string) => void;
}

export default function IdentityIssuancePickName({
    setAccountName,
}: Props): JSX.Element {
    const [name, setName] = useState('');
    const dispatch = useDispatch();

    function submit() {
        setAccountName(name);
        dispatch(push(routes.ACCOUNTCREATION_CHOOSEIDENTITY));
    }

    return (
        <div>
            <h2>The account name</h2>
            <p>bla bla</p>
            <span className={styles.modalElement}>
                <input
                    name="name"
                    className={styles.input}
                    placeholder="account name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    data-tid="hashInput"
                />
            </span>
            <button
                type="submit"
                onClick={() => {
                    submit();
                }}
            >
                submit
            </button>
        </div>
    );
}
