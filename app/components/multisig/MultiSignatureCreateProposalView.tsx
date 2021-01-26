import React, { useState } from 'react';
import { Header, Segment } from 'semantic-ui-react';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import UpdateMicroGtuPerEuroRate from './UpdateMicroGtuPerEuro';
import { UpdateType } from '../../utils/types';
import {
    BlockSummary,
    ConsensusStatus,
    getBlockSummary,
    getConsensusStatus,
} from '../../utils/client';
import routes from '../../constants/routes.json';
import DynamicModal from './DynamicModal';

interface Props {
    type: UpdateType;
}

/**
 * Component for displaying the UI required to create a multi signature transaction
 * proposal. It dynamically loads the correct component to show wrapped in a bit of
 * generic UI.
 * The component retrieves the block summary of the last finalized block, which
 * is used to get the threshold and sequence number required for update instructions.
 */
export default function MultiSignatureCreateProposalView({ type }: Props) {
    const [blockSummary, setBlockSummary] = useState<BlockSummary>();
    const [loading, setLoading] = useState(true);
    const dispatch = useDispatch();

    function chooseProposalType(foundationType: UpdateType) {
        switch (foundationType) {
            case UpdateType.UpdateMicroGTUPerEuro:
                return (
                    <UpdateMicroGtuPerEuroRate blockSummary={blockSummary} />
                );
            default:
                throw new Error(
                    'An unsupported transaction type was encountered.'
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
            {blockSummary && chooseProposalType(type)}
        </Segment>
    );
}
