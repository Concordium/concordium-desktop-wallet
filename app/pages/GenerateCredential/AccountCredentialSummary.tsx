import React from 'react';
import { useLocation } from 'react-router-dom';
import { Card, List } from 'semantic-ui-react';
import Identicon from '~/components/CopiableIdenticon/CopiableIdenticon';
import { Identity, CredentialDeploymentInformation } from '~/utils/types';
import Form from '~/components/Form';
import routes from '~/constants/routes.json';

interface Props {
    identity: Identity | undefined;
    address: string;
    setAddress: (address: string) => void;
    credential: CredentialDeploymentInformation | undefined;
    Button?: () => JSX.Element | null;
}

export default function AccountCredentialSummary({
    identity,
    address,
    setAddress,
    credential,
    Button = () => null,
}: Props) {
    const location = useLocation().pathname;

    return (
        <Card>
            <Card.Header>Account Credential Summary</Card.Header>
            <Card.Content textAlign="center">
                <List>
                    <List.Item>Identity:</List.Item>
                    <List.Item>
                        <b>
                            {identity
                                ? identity.name
                                : 'Choose an ID on the right'}
                        </b>
                    </List.Item>
                    <List.Item>Account:</List.Item>
                    <List.Item>
                        {location === routes.GENERATE_CREDENTIAL_PICKACCOUNT ? (
                            <Form onSubmit={() => {}}>
                                <Form.TextArea
                                    name="address"
                                    placeholder="Paste the account address here"
                                    value={address}
                                    onChange={(e) => {
                                        const newAddress = e.target.value;
                                        setAddress(newAddress);
                                    }}
                                />
                            </Form>
                        ) : (
                            <b> {address || 'To be determined'} </b>
                        )}
                    </List.Item>
                    <List.Item>Identicon:</List.Item>
                    <List.Item>
                        {credential ? (
                            <Identicon data={JSON.stringify(credential)} />
                        ) : (
                            <b>To be generated</b>
                        )}
                    </List.Item>
                </List>
                <Button />
            </Card.Content>
        </Card>
    );
}
