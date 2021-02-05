import React, { useState } from 'react';
import { push } from 'connected-react-router';
import { useDispatch } from 'react-redux';
import { Card, Form, Label, Input, Button } from 'semantic-ui-react';
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
        <Card fluid centered>
            <Card.Content textAlign="center">
                <Card.Header>
                    The initial account and identity names
                </Card.Header>
                <Card.Description>
                    The first step of creating a new identity is decide what to
                    name it. Besides naming the identity, you must also pick a
                    name for the initial account of the identity. After choosing
                    your names, you can continue to select an identity provider.
                </Card.Description>
                <Form onSubmit={submit}>
                    <Label>What would you like to name your identity?</Label>
                    <Form.Field>
                        <Input
                            placeholder="Identity name"
                            name="identity"
                            value={identity}
                            onChange={(e) => setIdentity(e.target.value)}
                        />
                    </Form.Field>
                    <Label>
                        What would you like to name your initial account?
                    </Label>
                    <Form.Field>
                        <Input
                            placeholder="Initial account name"
                            name="account"
                            value={account}
                            onChange={(e) => setAccount(e.target.value)}
                        />
                    </Form.Field>
                    <Button positive type="submit">
                        Continue to identity providers
                    </Button>
                </Form>
            </Card.Content>
        </Card>
    );
}
