import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import {
    loadProviders,
    providersSelector,
} from '../features/IdentityIssuanceSlice';
import routes from '../constants/routes.json';

export default function IdentityIssuanceChooseProvider(): JSX.Element {
    const dispatch = useDispatch();
    const providers = useSelector(providersSelector);

    useEffect(() => {
        loadProviders(dispatch);
    }, [dispatch]);

    return (
        <div>
            {providers.map((provider, i) => (
                <Link
                    to={`${routes.IDENTITYISSUANCE_EXTERNAL}/${i}`}
                    key={provider.ipInfo.ipIdentity}
                >
                    <img
                        alt="unable to display"
                        src={`data:image/png;base64, ${provider.metadata.icon}`}
                    />
                    {provider.ipInfo.ipDescription.name}
                </Link>
            ))}
        </div>
    );
}
