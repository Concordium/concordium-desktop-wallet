import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import { stringify } from 'json-bigint';
import { useParams } from 'react-router';
import { MultiSignatureTransaction, UpdateType } from '~/utils/types';
import { getBlockSummary, getConsensusStatus } from '~/utils/nodeRequests';
import { BlockSummary, ConsensusStatus } from '~/utils/NodeApiTypes';
import routes from '~/constants/routes.json';
import findHandler from '~/utils/updates/HandlerFinder';
import PageLayout from '~/components/PageLayout';
import Button from '~/cross-app-components/Button';

import DynamicModal from '../DynamicModal';
import EffectiveTimeUpdate from '../EffectiveTimeUpdate';
import styles from './MultiSignatureCreateProposal.module.scss';

/**
 * Component for displaying the UI required to create a multi signature transaction
 * proposal. It dynamically loads the correct component to show wrapped in a bit of
 * generic UI.
 * The component retrieves the block summary of the last finalized block, which
 * is used to get the threshold and sequence number required for update instructions.
 */
export default function MultiSignatureCreateProposalView() {
    const [blockSummary, setBlockSummary] = useState<BlockSummary>();
    const [loading, setLoading] = useState(true);
    const [proposal, setProposal] = useState<
        Partial<MultiSignatureTransaction>
    >();
    const [disabled, setDisabled] = useState(false);
    const dispatch = useDispatch();

    // TODO Add support for account transactions.
    const { updateType } = useParams<{ updateType: string }>();
    const type = parseInt(updateType, 10);

    const displayType = UpdateType[type];

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

    /**
     * Forwards the multi signature transactions to the signing page.
     */
    async function forwardTransactionToSigningPage(
        multiSignatureTransaction: Partial<MultiSignatureTransaction>
    ) {
        const signInput = {
            multiSignatureTransaction,
            blockSummary,
        };

        // Forward the transaction under creation to the signing page.
        dispatch(
            push({
                pathname: routes.MULTISIGTRANSACTIONS_SIGN_TRANSACTION,
                state: stringify(signInput),
            })
        );
    }

    return (
        <PageLayout>
            <PageLayout.Header>
                <h1>{handler.title}</h1>
            </PageLayout.Header>
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
            <PageLayout.Container closeRoute={routes.MULTISIGTRANSACTIONS}>
                <h2 className={styles.header}>
                    Transaction Proposal | {displayType}
                </h2>
                <h3>Transaction details</h3>
                <p>
                    Add all the details for the {displayType} transaction below.
                </p>
                {loading}
                {blockSummary && (
                    <EffectiveTimeUpdate
                        UpdateProposalComponent={UpdateComponent}
                        blockSummary={blockSummary}
                        setProposal={setProposal}
                        setDisabled={setDisabled}
                    />
                )}
                <Button
                    disabled={!proposal || disabled}
                    onClick={() => {
                        if (proposal) {
                            forwardTransactionToSigningPage(proposal);
                        }
                    }}
                >
                    Continue
                </Button>
            </PageLayout.Container>
        </PageLayout>
    );
    //     return (
    //         <PageLayout>
    //             <PageLayout.Header>
    //                 <h1>{handler.title}</h1>
    //             </PageLayout.Header>
    //             <Segment textAlign="center" secondary loading={loading}>
    //                 <Header size="large">Add the proposal details</Header>
    //                 <Segment basic>
    //                     Add all the details for the {displayType} proposal below,
    //                     and generate your transaction proposal.
    //                 </Segment>
    //                 <DynamicModal
    //                     execution={execution}
    //                     onError={() => {
    //                         dispatch(
    //                             push({ pathname: routes.MULTISIGTRANSACTIONS })
    //                         );
    //                     }}
    //                     onSuccess={(input: BlockSummary) =>
    //                         updateBlockSummary(input)
    //                     }
    //                     title="Error communicating with node"
    //                     content="We were unable to retrieve the block summary from the
    //             configured node. Verify your node settings, and check that
    //             the node is running."
    //                 />
    //                 <Segment>
    //                     <Header>Transaction Proposal | {displayType}</Header>
    //                     <Divider />
    //                     {blockSummary ? (
    //                         <EffectiveTimeUpdate
    //                             UpdateProposalComponent={UpdateComponent}
    //                             blockSummary={blockSummary}
    //                             setProposal={setProposal}
    //                             setDisabled={setDisabled}
    //                         />
    //                     ) : null}
    //                     <Divider horizontal hidden />
    //                     <Button
    //                         size="large"
    //                         primary
    //                         disabled={!proposal || disabled}
    //                         onClick={() => {
    //                             if (proposal) {
    //                                 forwardTransactionToSigningPage(proposal);
    //                             }
    //                         }}
    //                     >
    //                         Continue
    //                     </Button>
    //                 </Segment>
    //             </Segment>
    //         </PageLayout>
    //     );
}
