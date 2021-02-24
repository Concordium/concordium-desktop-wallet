import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { List, Grid } from 'semantic-ui-react';
import { chosenIdentitySelector } from '../../features/IdentitySlice';
import IdentityListElement from '../../components/IdentityListElement';
import { IdentityObject, IdentityStatus } from '../../utils/types';
import attributeNamesJson from '../../constants/attributeNames.json';
import ChoiceModal from '../../components/ChoiceModal';
import routes from '../../constants/routes.json';

const attributeNames: Record<string, string> = attributeNamesJson;

/**
 * Detailed view of the chosen identity.
 */
export default function IdentityView() {
    const identity = useSelector(chosenIdentitySelector);
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        if (identity && identity.status === IdentityStatus.Rejected) {
            setModalOpen(true);
        } else {
            setModalOpen(false);
        }
    }, [identity, setModalOpen]);

    if (identity === undefined) {
        return null;
    }

    if (identity.status === IdentityStatus.Rejected) {
        return (
            <ChoiceModal
                title={`The identity and initial account creation failed (${identity.name})`}
                description="Unfortunately something went wrong with your new identity and initial account. You can either go back and try again, or try again later."
                open={modalOpen}
                actions={[
                    { label: 'Try Again', location: routes.IDENTITYISSUANCE },
                    { label: 'Later' },
                ]}
                postAction={() => setModalOpen(false)}
            />
        );
    }
    if (identity.status === IdentityStatus.Pending) {
        return (
            <List centered>
                <IdentityListElement identity={identity} />
            </List>
        );
    }

    const identityObject: IdentityObject = JSON.parse(identity.identityObject)
        .value;

    return (
        <List centered>
            <IdentityListElement identity={identity} />
            <Grid container columns={2} divided="vertically">
                {Object.keys(identityObject.attributeList.chosenAttributes).map(
                    (attribute: string) => (
                        <Grid.Row key={attribute}>
                            <Grid.Column textAlign="left">
                                {attributeNames[attribute]}
                            </Grid.Column>
                            <Grid.Column textAlign="right">
                                {
                                    identityObject.attributeList
                                        .chosenAttributes[attribute]
                                }
                            </Grid.Column>
                        </Grid.Row>
                    )
                )}
            </Grid>
        </List>
    );
}
