import React from 'react';
import { Header, Segment } from 'semantic-ui-react';
import UpdateMicroGtuPerEuroRate from './UpdateMicroGtuPerEuro';
import { UpdateType } from '../../utils/types';

interface Location {
    state: UpdateType;
}

interface Props {
    location: Location;
}

/**
 * Component for displaying the UI required to create a multi signature transaction
 * proposal. It dynamically loads the correct component to show wrapped in a bit of
 * generic UI.
 */
export default function MultiSignatureCreateProposalView({ location }: Props) {
    const type = location.state;
    function chooseProposalType(foundationType: UpdateType) {
        switch (foundationType) {
            case UpdateType.UpdateMicroGTUPerEuro:
                return <UpdateMicroGtuPerEuroRate />;
            default:
                throw new Error(
                    'An unsupported transaction type was encountered.'
                );
        }
    }

    return (
        <Segment textAlign="center" secondary>
            <Header size="large">Add the proposal details</Header>
            <Segment basic>
                Add all the details for the {UpdateType[type]} proposal below,
                and generate your transaction proposal.
            </Segment>
            {chooseProposalType(type)}
        </Segment>
    );
}
