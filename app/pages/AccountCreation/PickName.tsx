import React, { useState } from 'react';
import { push } from 'connected-react-router';
import { useDispatch } from 'react-redux';
import { Card, Form, Label, Input, Button } from 'semantic-ui-react';
import routes from '../../constants/routes.json';

interface Props {
    setAccountName: (name: string) => void;
}

// TODO: add Validation check on the name.
export default function IdentityIssuancePickName({
    setAccountName,
}: Props): JSX.Element {
    const [name, setName] = useState('');
    const dispatch = useDispatch();

    function submit() {
        setAccountName(name);
        dispatch(push(routes.ACCOUNTCREATION_PICKIDENTITY));
    }

    return (
        <Card fluid centered>
            <Card.Content textAlign="center">
                <Card.Header>Naming your new account</Card.Header>
                <Card.Description>
                    The first step of creating a new account, is giving it a
                    name.
                </Card.Description>
                <Form onSubmit={submit}>
                    <Label>What would you like to name your account?</Label>
                    <Form.Field>
                        <Input
                            name="name"
                            placeholder="Account name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </Form.Field>
                    <Button positive type="submit">
                        Next
                    </Button>
                </Form>
            </Card.Content>
        </Card>
    );
}
