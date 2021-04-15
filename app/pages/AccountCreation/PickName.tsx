import React, { useState } from 'react';
import { Card, Form, Label, Input, Button } from 'semantic-ui-react';

interface Props {
    submitName: (name: string) => void;
}

// TODO: add Validation check on the name.
export default function IdentityIssuancePickName({
    submitName,
}: Props): JSX.Element {
    const [name, setName] = useState('');

    function submit() {
        submitName(name);
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
