import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import {
    loadProviders,
    providersSelector,
} from '../features/identityIssuanceSlice';
import routes from '../constants/routes.json';

export default function f() {
    const dispatch = useDispatch();
    const providers = useSelector(providersSelector);

    console.log(providers);

    useEffect(() => {
        loadProviders(dispatch);
    }, [dispatch]);

    return (
        <div>
            {providers.map((provider, i) => (
                <Link to={`${routes.IDENTITYISSUANCE_EXTERNAL}/${i}`}>
                    <img
                        src={`data:image/png;base64, ${provider.metadata.icon}`}
                    />
                    {provider.ipInfo.ipDescription.name}
                </Link>
            ))}
        </div>
    );
}
