import React from 'react';
import { Header, Segment } from 'semantic-ui-react';
import UpdateMicroGtuPerEuroRate from '../components/multisig/UpdateMicroGtuPerEuro';
import { UpdateType } from '../utils/types';

interface Props {
    type: UpdateType;
}

export default function MultiSignatureProposalPage({ type }: Props) {
    // FIXME This could also be something that is not a foundation transaction!

    function chooseProposalType(foundationType: UpdateType) {
        switch (foundationType) {
            case UpdateType.UpdateMicroGTUPerEuro:
                return <UpdateMicroGtuPerEuroRate />;
            default:
                return <div>Invalid!</div>;
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
