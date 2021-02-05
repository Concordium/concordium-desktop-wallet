import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import { Card, List, Image, Button, Divider } from 'semantic-ui-react';
import routes from '../../constants/routes.json';
import { getIdentityProviders } from '../../utils/httpRequests';
import { IdentityProvider } from '../../utils/types';

interface Props {
    setProvider: (provider: IdentityProvider) => void;
}

export default function IdentityIssuanceChooseProvider({
    setProvider,
}: Props): JSX.Element {
    const dispatch = useDispatch();
    const [providers, setProviders] = useState<IdentityProvider[]>([]);

    useEffect(() => {
        getIdentityProviders()
            .then((loadedProviders) => setProviders(loadedProviders))
            // eslint-disable-next-line no-console
            .catch(console.log); // TODO: Handle that we are unable to load providers.
    }, []);

    function onClick(provider: IdentityProvider) {
        setProvider(provider);
        dispatch(push(routes.IDENTITYISSUANCE_EXTERNAL));
    }

    return (
        <Card fluid centered>
            <Card.Content textAlign="center">
                <Card.Header>The identity provider</Card.Header>
                <Card.Description>
                    The next step of creating a new identity is to choose an
                    identity provider. The list of providers will be expanding
                    over time, but the current providers can be seen below. You
                    can check out their privacy policies before selecting a
                    provider.
                </Card.Description>
                <List>
                    <Divider />
                    {providers.map((provider) => (
                        <>
                            <List.Item
                                key={provider.ipInfo.ipIdentity}
                                onClick={() => onClick(provider)}
                            >
                                <Image
                                    spaced="right"
                                    size="small"
                                    src={`data:image/png;base64, ${provider.metadata.icon}`}
                                />
                                <List.Content verticalAlign="middle">
                                    <List.Header>
                                        {provider.ipInfo.ipDescription.name}
                                    </List.Header>
                                </List.Content>
                                <Button>Privacy Policy</Button>
                            </List.Item>
                            <Divider />
                        </>
                    ))}
                </List>
            </Card.Content>
        </Card>
    );
}
