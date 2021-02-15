import React, { useState } from 'react';
import { Header, Segment } from 'semantic-ui-react';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import { stringify } from 'json-bigint';
import UpdateMicroGtuPerEuroRate from './UpdateMicroGtuPerEuro';
import { MultiSignatureTransaction, UpdateType } from '../../utils/types';
import { getBlockSummary, getConsensusStatus } from '../../utils/client';
import { BlockSummary, ConsensusStatus } from '../../utils/NodeApiTypes';
import routes from '../../constants/routes.json';
import DynamicModal from './DynamicModal';
import UpdateEuroPerEnergy from './UpdateEuroPerEnergy';
import UpdateTransactionFeeDistribution from './UpdateTransactionFeeDistribution';
import UpdateFoundationAccount from './UpdateFoundationAccount';

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

    function chooseProposalType(foundationType: UpdateType) {
        if (!blockSummary) {
            return null;
        }
        switch (foundationType) {
            case UpdateType.UpdateMicroGTUPerEuro:
                return (
                    <UpdateMicroGtuPerEuroRate
                        blockSummary={blockSummary}
                        forwardTransaction={forwardTransactionToSigningPage}
                    />
                );
            case UpdateType.UpdateEuroPerEnergy:
                return (
                    <UpdateEuroPerEnergy
                        blockSummary={blockSummary}
                        forwardTransaction={forwardTransactionToSigningPage}
                    />
                );
            case UpdateType.UpdateTransactionFeeDistribution:
                return (
                    <UpdateTransactionFeeDistribution
                        blockSummary={blockSummary}
                        forwardTransaction={forwardTransactionToSigningPage}
                    />
                );
            case UpdateType.UpdateFoundationAccount:
                return (
                    <UpdateFoundationAccount
                        blockSummary={blockSummary}
                        forwardTransaction={forwardTransactionToSigningPage}
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
