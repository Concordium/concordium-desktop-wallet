import React, { useState } from 'react';
import { Header, Segment } from 'semantic-ui-react';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import UpdateMicroGtuPerEuroRate from './UpdateMicroGtuPerEuro';
import { MultiSignatureTransaction, UpdateType } from '../../utils/types';
import { getBlockSummary, getConsensusStatus } from '../../utils/client';
import { BlockSummary, ConsensusStatus } from '../../utils/NodeApiTypes';
import routes from '../../constants/routes.json';
import DynamicModal from './DynamicModal';
import UpdateEuroPerEnergy from './UpdateEuroPerEnergy';
import { insert } from '../../database/MultiSignatureProposalDao';
import { setCurrentProposal } from '../../features/MultiSignatureSlice';

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
 * The component retrieves the block summary of the last finalized block, which
 * is used to get the threshold and sequence number required for update instructions.
 */
export default function MultiSignatureCreateProposalView({ location }: Props) {
    const [blockSummary, setBlockSummary] = useState<BlockSummary>();
    const [loading, setLoading] = useState(true);
    const dispatch = useDispatch();

    // TODO Add support for account transactions.
    const type: UpdateType = location.state;

    /**
     * Inserts the provided multi signature transaction into the database and
     * the state, and then navigates to the created proposal.
     */
    // TODO: When signing before exporting has been added, then this has to be updated too
    async function generateTransaction(
        multiSignatureTransaction: Partial<MultiSignatureTransaction>
    ) {
        // Save to database and use the assigned id to update the local object.
        const entryId = (await insert(multiSignatureTransaction))[0];
        multiSignatureTransaction.id = entryId;

        // Set the current proposal in the state to the one that was just generated.
        dispatch(setCurrentProposal(multiSignatureTransaction));

        // Navigate to the page that displays the current proposal from the state.
        dispatch(push(routes.MULTISIGTRANSACTIONS_PROPOSAL_EXISTING));
    }

    function chooseProposalType(foundationType: UpdateType) {
        if (!blockSummary) {
            return null;
        }
        switch (foundationType) {
            case UpdateType.UpdateMicroGTUPerEuro:
                return (
                    <UpdateMicroGtuPerEuroRate
                        blockSummary={blockSummary}
                        generateTransaction={generateTransaction}
                    />
                );
            case UpdateType.UpdateEuroPerEnergy:
                return (
                    <UpdateEuroPerEnergy
                        blockSummary={blockSummary}
                        generateTransaction={generateTransaction}
                    />
                );
            default:
                return (
                    // TODO Update when all types have been implemented.
                    <Header>Not implemented yet</Header>
                );
        }
    }

    function updateBlockSummary(blockSummaryInput: BlockSummary) {
        setBlockSummary(blockSummaryInput);
        setLoading(false);
    }

    async function execution() {
        const consensusStatus: ConsensusStatus = await getConsensusStatus();
        return getBlockSummary(consensusStatus.lastFinalizedBlock);
    }
    return (
        <Segment textAlign="center" secondary loading={loading}>
            <Header size="large">Add the proposal details</Header>
            <Segment basic>
                Add all the details for the {UpdateType[type]} proposal below,
                and generate your transaction proposal.
            </Segment>
            <DynamicModal
                execution={execution}
                onError={() => {
                    dispatch(push({ pathname: routes.MULTISIGTRANSACTIONS }));
                }}
                onSuccess={(input: BlockSummary) => updateBlockSummary(input)}
                title="Error communicating with node"
                content="We were unable to retrieve the block summary from the
                configured node. Verify your node settings, and check that
                the node is running."
            />
            {chooseProposalType(type)}
        </Segment>
    );
}
