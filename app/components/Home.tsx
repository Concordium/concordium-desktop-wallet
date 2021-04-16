import React from 'react';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import Button from '~/cross-app-components/Button';
import routes from '~/constants/routes.json';

export default function Home(): JSX.Element {
    const dispatch = useDispatch();

    return (
        <div>
            <h2>Home</h2>
            <Button onClick={() => dispatch(push(routes.CREATEGENESISACCOUNT))}>
                Create Genesis Account
            </Button>
        </div>
    );
}
