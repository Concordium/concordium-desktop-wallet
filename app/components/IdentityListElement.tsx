import React from 'react';
import { Grid, Header, Label, Image } from 'semantic-ui-react';
import { Identity, IdentityStatus } from '../utils/types';
import PendingImage from '../../resources/svg/pending_old.svg';
import SuccessImage from '../../resources/svg/success_old.svg';
import RejectedImage from '../../resources/svg/warning_old.svg';
import { formatDate } from '../utils/timeHelpers';

interface Props {
    identity: Identity;
}

// Returns the image corresponding to the given status.
function statusImage(status: IdentityStatus) {
    switch (status) {
        case IdentityStatus.Confirmed:
            return <SuccessImage />;
        case IdentityStatus.Rejected:
            return <RejectedImage />;
        case IdentityStatus.Pending:
            return <PendingImage />;
        default:
            return undefined;
    }
}

/**
 * Displays the information of the Identity.
 * TODO: Simplify structure
 */
function IdentityListElement({ identity }: Props): JSX.Element {
    const identityProvider = JSON.parse(identity.identityProvider);
    const identityObject = JSON.parse(identity.identityObject);
    return (
        <Grid columns={3}>
            <Grid.Row>
                <Grid.Column textAlign="left">
                    <Image
                        src={`data:image/png;base64, ${identityProvider.metadata.icon}`}
                        alt={identity.status}
                        size="mini"
                        spaced
                    />
                    {statusImage(identity.status)}
                </Grid.Column>
                <Grid.Column />
                <Grid.Column textAlign="right">
                    <Label content="Identity" />
                </Grid.Column>
            </Grid.Row>
            <Grid.Row>
                <Grid.Column />
                <Grid.Column>
                    <Header textAlign="center"> {identity.name} </Header>
                </Grid.Column>
                <Grid.Column />
            </Grid.Row>
            <Grid.Row>
                <Grid.Column />
                <Grid.Column>
                    <Label>
                        {identityObject
                            ? ` Expires on ${formatDate(
                                  identityObject.value.attributeList.validTo
                              )} `
                            : undefined}
                    </Label>
                </Grid.Column>
            </Grid.Row>
        </Grid>
    );
}

export default IdentityListElement;
