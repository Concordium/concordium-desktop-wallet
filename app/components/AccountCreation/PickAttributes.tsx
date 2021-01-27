import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import { Card, Button, Grid, Checkbox } from 'semantic-ui-react';
import routes from '../../constants/routes.json';
import { Identity } from '../../utils/types';
import IdentityListElement from '../IdentityListElement';

interface Props {
    identity: Identity;
    setChosenAttributes: (attributes: string[]) => void;
}
export default function AccountCreationPickAttributes({
    identity,
    setChosenAttributes,
}: Props): JSX.Element {
    const dispatch = useDispatch();
    const [attributes, setAttributes] = useState([]);

    useEffect(() => {
        const identityAttributes = JSON.parse(identity.identityObject).value
            .attributeList.chosenAttributes;
        setAttributes(
            Object.entries(identityAttributes).map(([tag, value]) => ({
                tag,
                value,
                isChecked: false,
            }))
        );
    }, [identity]);

    function submit() {
        const attributeObject = [];
        attributes
            .filter((x) => x.isChecked)
            .forEach(({ tag }) => attributeObject.push(tag));
        setChosenAttributes(attributeObject);
        dispatch(push(routes.ACCOUNTCREATION_GENERATE));
    }

    return (
        <Grid stretched container columns={2}>
            <Grid.Column>
                <Card fluid centered>
                    <Card.Content textAlign="center">
                        <Card.Header>
                            Choose which attributes to reveal
                        </Card.Header>
                        <Card.Description>
                            On the right you can choose which attributes you
                            want to reveal on your account. You can choose
                            however many you want, including none. Which
                            attributes do you want to reveal?
                        </Card.Description>
                        <Button onClick={submit}>
                            Submit with revealed attributes
                        </Button>
                    </Card.Content>
                </Card>
            </Grid.Column>
            <Grid.Column>
                <Card centered>
                    <IdentityListElement
                        identity={identity}
                        highlighted
                        index={0}
                    />
                </Card>
                <Card centered>
                    {attributes.map((attribute, i) => (
                        <Checkbox
                            key={attribute.tag}
                            checked={attribute.isChecked}
                            label={`${attribute.tag}: ${attribute.value}`}
                            onClick={() => {
                                // TODO: find better way?
                                const newAttributes = [...attributes];
                                newAttributes[i].isChecked = !newAttributes[i]
                                    .isChecked;
                                setAttributes(newAttributes);
                            }}
                        />
                    ))}
                </Card>
            </Grid.Column>
        </Grid>
    );
}
