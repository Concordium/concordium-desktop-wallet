import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import routes from '../../constants/routes.json';
import styles from './IdentityIssuance.css';
import { getIdentityProviders } from '../../utils/httpRequests';
import { IdentityProvider } from '../../utils/types';

interface Props {
    setProvider: (provider: IdentityProvider) => void;
}

export default function IdentityIssuanceChooseProvider({
    setProvider,
}: Props): JSX.Element {
    const dispatch = useDispatch();
    const [providers, setProviders] = useState([]);

    useEffect(() => {
        getIdentityProviders()
            .then((loadedProviders) => setProviders(loadedProviders.data))
            // eslint-disable-next-line no-console
            .catch(console.log); // TODO: Handle that we are unable to load providers.
    }, []);

    function onClick(provider) {
        setProvider(provider);
        dispatch(push(routes.IDENTITYISSUANCE_EXTERNAL));
    }

    return (
        <div>
            <h2>The identity provider</h2>
            <p>
                The next step of creating a new identity is to choose an
                identity provider. The list of providers will be expanding over
                time, but the current providers can be seen below. You can check
                out their privacy policies before selecting a provider.
            </p>
            {providers.map((provider) => (
                <div
                    className={styles.providerListElement}
                    key={provider.ipInfo.ipIdentity}
                    onClick={() => onClick(provider)}
                >
                    <img
                        className={styles.providerImage}
                        alt="unable to display"
                        src={`data:image/png;base64, ${provider.metadata.icon}`}
                    />
                    <div className={styles.providerText}>
                        {provider.ipInfo.ipDescription.name}
                    </div>
                    <div className={styles.providerText}>Privacy Policy</div>
                </div>
            ))}
        </div>
    );
}
