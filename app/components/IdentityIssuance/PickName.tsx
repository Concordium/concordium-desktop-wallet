import React, { useState } from 'react';
import { push } from 'connected-react-router';
import { useDispatch } from 'react-redux';
import styles from '../Styling.css';
import routes from '../../constants/routes.json';

interface Props {
    setIdentityName: (name: string) => void;
    setAccountName: (name: string) => void;
}

// TODO: add Validation to names
export default function IdentityIssuancePickName({
    setIdentityName,
    setAccountName,
}: Props): JSX.Element {
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
            <p>
                The first step of creating a new identity is decide what to name
                it. Besides naming the identity, you must also pick a name for
                the initial account of the identity. After choosing your names,
                you can continue to select an identity provider.
            </p>
            <p>What would you like to name your identity?</p>
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
            <p>What would you like to name your initial account?</p>
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
                Continue to identity providers
            </button>
        </div>
    );
}
