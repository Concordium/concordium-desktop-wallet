import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Card, Button, List, Divider } from 'semantic-ui-react';
import routes from '../../constants/routes.json';
import { accountsSelector } from '../../features/AccountSlice';
import { identitiesSelector } from '../../features/IdentitySlice';
import AccountListElement from '../AccountListElement';
import IdentityListElement from '../IdentityListElement';

interface Props {
    identityName: string;
    accountName: string;
}

export default function IdentityIssuanceFinal({
    identityName,
    accountName,
}: Props): JSX.Element {
    const accounts = useSelector(accountsSelector);
    const identities = useSelector(identitiesSelector);

    const account = accounts.find((acc) => acc.name === accountName);
    const identity = identities.find((id) => id.name === identityName);

    if (account === undefined || identity === undefined) {
        return null;
    }

    return (
        <Card fluid centered>
            <Card.Content textAlign="center">
                <Card.Header>
                    Your request is being finished by the provider
                </Card.Header>
                <Card.Description>
                    While the identity provider is verifying your identity and
                    submitting your initial account, you can see an overview
                    here. Once finished by the provider, you can start using
                    both.
                </Card.Description>
                <Divider />
                <List horizontal divided>
                    <List.Item>
                        <IdentityListElement identity={identity} />
                    </List.Item>
                    <List.Item>
                        <AccountListElement account={account} />
                    </List.Item>
                </List>
                <Divider />
                <Link to={routes.IDENTITIES}>
                    <Button>Finished!</Button>
                </Link>
            </Card.Content>
        </Card>
    );
}
