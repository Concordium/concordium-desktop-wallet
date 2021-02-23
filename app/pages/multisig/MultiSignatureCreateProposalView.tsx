import React, { useState } from 'react';
import { Divider, Header, Segment } from 'semantic-ui-react';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import { stringify } from 'json-bigint';
import { MultiSignatureTransaction, UpdateType } from '../../utils/types';
import { getBlockSummary, getConsensusStatus } from '../../utils/nodeRequests';
import { BlockSummary, ConsensusStatus } from '../../utils/NodeApiTypes';
import routes from '../../constants/routes.json';
import DynamicModal from './DynamicModal';
import findHandler from '../../utils/updates/HandlerFinder';
import PageHeader from '../../components/PageHeader';

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
    const displayType = UpdateType[type];

    /**
     * Forwards the multi signature transactions to the signing page.
     */
    async function forwardTransactionToSigningPage(
        multiSignatureTransaction: Partial<MultiSignatureTransaction>
    ) {
        // Forward the transaction under creation to the signing page.
        dispatch(
            push({
                pathname: routes.MULTISIGTRANSACTIONS_SIGN_TRANSACTION,
                state: stringify(multiSignatureTransaction),
            })
        );
    }

    const handler = findHandler(type);
    const UpdateComponent = handler.update;

    function updateBlockSummary(blockSummaryInput: BlockSummary) {
        setBlockSummary(blockSummaryInput);
        setLoading(false);
    }

    async function execution() {
        const consensusStatus: ConsensusStatus = await getConsensusStatus();
        return getBlockSummary(consensusStatus.lastFinalizedBlock);
    }
    return (
        <>
            <PageHeader>
                <h1>{handler.title}</h1>
            </PageHeader>
            <Segment textAlign="center" secondary loading={loading}>
                <Header size="large">Add the proposal details</Header>
                <Segment basic>
                    Add all the details for the {UpdateType[type]} proposal
                    below, and generate your transaction proposal.
                </Segment>
                <DynamicModal
                    execution={execution}
                    onError={() => {
                        dispatch(
                            push({ pathname: routes.MULTISIGTRANSACTIONS })
                        );
                    }}
                    onSuccess={(input: BlockSummary) =>
                        updateBlockSummary(input)
                    }
                    title="Error communicating with node"
                    content="We were unable to retrieve the block summary from the
            configured node. Verify your node settings, and check that
            the node is running."
                />
                <Segment>
                    <Header>Transaction Proposal | {displayType}</Header>
                    <Divider />
                    {blockSummary ? (
                        <UpdateComponent
                            blockSummary={blockSummary}
                            forwardTransaction={forwardTransactionToSigningPage}
                        />
                    ) : null}
                </Segment>
            </Segment>
        </>
    );
}
