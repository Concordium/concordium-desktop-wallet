import React, { useState } from 'react';
import { push } from 'connected-react-router';
import { useDispatch } from 'react-redux';
import styles from './Styling.css';
import routes from '../constants/routes.json';

export default function IdentityIssuancePickName(
    setIdentityName,
    setAccountName
): JSX.Element {
    const [identity, setIdentity] = useState('');
    const [account, setAccount] = useState('');
    const dispatch = useDispatch();

    function submit() {
        setIdentityName(identity);
        setAccountName(account);
        dispatch(push(routes.IDENTITYISSUANCE_PICKPROVIDER));
    }

    return (
        <div>
            <h2>The initial account and identity names</h2>
            <p>bla bla</p>
            <span className={styles.modalElement}>
                <input
                    name="name"
                    className={styles.input}
                    placeholder="Identity name"
                    value={identity}
                    onChange={(e) => setIdentity(e.target.value)}
                    data-tid="hashInput"
                />
            </span>
            <span className={styles.modalElement}>
                <input
                    name="address"
                    className={styles.input}
                    placeholder="Initial account name"
                    value={account}
                    onChange={(e) => setAccount(e.target.value)}
                    data-tid="hashInput"
                />
            </span>
            <button
                type="button"
                onClick={() => {
                    submit();
                }}
            >
                Let’s continue
            </button>
        </div>
    );
}
