import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import { Menu, Card, Button } from 'semantic-ui-react';
import { confirmedIdentitiesSelector } from '../../features/IdentitySlice';
import routes from '../../constants/routes.json';
import IdentityCard from '../../components/IdentityCard';
import { Identity } from '../../utils/types';

interface Props {
    setIdentity: (identity: Identity) => void;
}

export default function AccountCreationPickIdentity({
    setIdentity,
}: Props): JSX.Element | null {
    const [chosenIndex, chooseIdentity] = useState(0);
    const dispatch = useDispatch();
    const identities = useSelector(confirmedIdentitiesSelector);

    if (!identities) {
        return null;
    }
    if (identities.length === 0) {
        return (
            <Card fluid centered>
                <Card.Content textAlign="center">
                    <Card.Header>No identities found</Card.Header>
                    <Card.Description>
                        Please create an identity before attempting to create an
                        account, and wait until it has been confirmed.
                    </Card.Description>
                    <Button onClick={() => dispatch(push(routes.ACCOUNTS))}>
                        Return to accounts
                    </Button>
                </Card.Content>
            </Card>
        );
    }

    function submit(route: string) {
        setIdentity(identities[chosenIndex]);
        dispatch(push(route));
    }

    return (
        <Card fluid centered>
            <Card.Content textAlign="center">
                <Card.Header>Choose an identity</Card.Header>
                <Card.Description>
                    The next step is to choose what identity to use, for
                    creating your new account. Besides choosing your identity,
                    you must decide whether to reveal any attributes on the
                    account, and how many. Besides deciding on an identity, you
                    can decide to reveal a number of attributes on your account,
                    though this is not necessary. Which identity do you want to
                    use?
                </Card.Description>
                <Menu vertical fluid>
                    {identities.map((identity: Identity, i: number) => (
                        <Menu.Item
                            key={identity.id}
                            onClick={() => chooseIdentity(i)}
                            active={chosenIndex === i}
                        >
                            <IdentityCard identity={identity} />
                        </Menu.Item>
                    ))}
                </Menu>
                <Button.Group>
                    <Button
                        onClick={() => {
                            submit(routes.ACCOUNTCREATION_PICKATTRIBUTES);
                        }}
                    >
                        Choose attributes to reveal
                    </Button>
                    <Button
                        positive
                        onClick={() => {
                            submit(routes.ACCOUNTCREATION_GENERATE);
                        }}
                    >
                        Continue without revealing attributes
                    </Button>
                </Button.Group>
            </Card.Content>
        </Card>
    );
}
