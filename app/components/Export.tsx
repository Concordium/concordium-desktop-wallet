import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Button } from 'semantic-ui-react';
import { loadIdentities, identitiesSelector } from '../features/IdentitySlice';
import { loadAccounts, accountsSelector } from '../features/AccountSlice';

export default function Export() {
    const dispatch = useDispatch();
    const accounts = useSelector(accountsSelector);
    const identities = useSelector(identitiesSelector);

    useEffect(() => {
        loadAccounts(dispatch);
        loadIdentities(dispatch);
    }, [dispatch]);

    if (identities === undefined || accounts === undefined) {
        return null;
    }

    return (
        <Card fluid style={{ height: '75vh' }}>
            <Card.Header textAlign="center">Export</Card.Header>
            <Card.Description>
                Choose what ID’s and accounts you want to export below:
            </Card.Description>
            <Card.Content extra>
                <Button primary>Export</Button>
            </Card.Content>
        </Card>
    );
}
