import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Card, Button, Divider } from 'semantic-ui-react';

import routes from '../../constants/routes.json';
import { accountsSelector } from '../../features/AccountSlice';
import AccountListElement from '../../components/AccountListElement';

interface Props {
    accountName: string;
}

export default function AccountCreationFinal({
    accountName,
}: Props): JSX.Element | null {
    const accounts = useSelector(accountsSelector);

    if (accounts === undefined) {
        return null;
    }

    const account = accounts.find((acc) => acc.name === accountName);

    if (account === undefined) {
        throw new Error(
            'Newly created account not found. This should not happen'
        );
    }

    return (
        <Card fluid centered>
            <Card.Content textAlign="center">
                <Card.Header>Your account has been submitted</Card.Header>
                <Card.Description>
                    That was it! Now you just have to wait for your account to
                    be finalized on the block-chain.
                </Card.Description>
                <Divider />
                <Card centered>
                    <AccountListElement account={account} />
                </Card>
                <Divider />
                <Link to={routes.ACCOUNTS}>
                    <Button>Finished!</Button>
                </Link>
            </Card.Content>
        </Card>
    );
}
