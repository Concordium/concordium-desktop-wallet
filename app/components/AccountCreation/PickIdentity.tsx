import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import { Card, Button, List } from 'semantic-ui-react';
import {
    loadIdentities,
    identitiesSelector,
} from '../../features/IdentitySlice';
import routes from '../../constants/routes.json';
import styles from '../Identity.css';
import IdentityListElement from '../IdentityListElement';
import { Identity } from '../../utils/types';

interface Props {
    setIdentity: (identity: Identity) => void;
}

export default function AccountCreationPickIdentity({
    setIdentity,
}: Props): JSX.Element {
    const [chosenIndex, chooseIdentity] = useState(0);
    const dispatch = useDispatch();
    const identities = useSelector(identitiesSelector);

    useEffect(() => {
        if (!identities) {
            loadIdentities(dispatch);
        }
    }, [dispatch, identities]);

    if (!identities) {
        return null;
    }

    function submit(route) {
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
                <List relaxed>
                    {identities.map((identity, i) => (
                        <List.Item
                            key={identity.id}
                            onClick={() => chooseIdentity(i)}
                            className={`${styles.identityListElement} ${
                                chosenIndex === i
                                    ? styles.chosenIdentityListElement
                                    : null
                            }`}
                        >
                            <IdentityListElement identity={identity} />
                        </List.Item>
                    ))}
                </List>
                <Button.Group>
                    <Button
                        disabled={
                            identities[chosenIndex].identityObject == null
                        }
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
