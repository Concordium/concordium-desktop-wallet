import React from 'react';
import { Card, Button, Header } from 'semantic-ui-react';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import routes from '~/constants/routes.json';

/**
 * Component, that will display, when there are no Identities.
 */
export default function NoIdentities() {
    const dispatch = useDispatch();
    return (
        <Card centered>
            <Header textAlign="center">
                It looks like you don’t have an identity and initial account
                yet!
            </Header>
            <Card.Description textAlign="center">
                An identity and an initial account is needed before you can
                start using the Concordium blockchain. You can either request a
                new identity and an initial account from an identity provider,
                or if you already have an identity and account, you can import
                it.
            </Card.Description>
            <Card.Content>
                <Button.Group>
                    <Button onClick={() => dispatch(push(routes.EXPORTIMPORT))}>
                        Import Existing
                    </Button>
                    <Button
                        onClick={() => dispatch(push(routes.IDENTITYISSUANCE))}
                    >
                        Request new
                    </Button>
                </Button.Group>
            </Card.Content>
        </Card>
    );
}
