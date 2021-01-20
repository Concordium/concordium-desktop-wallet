import React from 'react';
import { Header, Segment } from 'semantic-ui-react';
import { FoundationTransactionTypes } from '../components/multisig/MultiSignatureCreateProposalView';
import UpdateMicroGtuPerEuroRate from '../components/multisig/UpdateMicroGtuPerEuro';

interface Props {
    type: FoundationTransactionTypes;
}

export default function MultiSignatureProposalPage({ type }: Props) {
    // FIXME This could also be something that is not a foundation transaction!

    function chooseProposalType(type: FoundationTransactionTypes) {
        console.log(type);
        switch (type) {
            case 4:
                return <UpdateMicroGtuPerEuroRate />;
            case FoundationTransactionTypes.UpdateEuroEnergyRate:
                return <h3>Nice type</h3>;
            default:
                return <div>Invalid!</div>;
        }
    }

    return (
        <Segment textAlign="center" secondary>
            <Header size="large">Add the proposal details</Header>
            <Segment basic>
                Add all the details for the {FoundationTransactionTypes[type]}{' '}
                proposal below, and generate your transaction proposal.
            </Segment>
            {chooseProposalType(type)}
        </Segment>
    );
}
