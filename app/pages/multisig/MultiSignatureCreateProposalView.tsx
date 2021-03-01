import React, { useState } from 'react';
import { Button, Divider, Header, Segment } from 'semantic-ui-react';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import { stringify } from 'json-bigint';
import { MultiSignatureTransaction, UpdateType } from '../../utils/types';
import { getBlockSummary, getConsensusStatus } from '../../utils/nodeRequests';
import { BlockSummary, ConsensusStatus } from '../../utils/NodeApiTypes';
import routes from '../../constants/routes.json';
import DynamicModal from './DynamicModal';
import findHandler from '../../utils/updates/HandlerFinder';
import ConcordiumLedgerClient from '../../features/ledger/ConcordiumLedgerClient';
import LedgerComponent from '../../components/ledger/LedgerComponent';
import { getGovernancePath } from '../../features/ledger/Path';
import EffectiveTimeUpdate from './EffectiveTimeUpdate';
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
    const [publicKey, setPublicKey] = useState<string>();
    const [
        authorizedVerifyKeyIndex,
        setAuthorizedVerifyKeyIndex,
    ] = useState<number>();
    const [proposal, setProposal] = useState<
        Partial<MultiSignatureTransaction>
    >();
    const [disabled, setDisabled] = useState(false);
    const dispatch = useDispatch();

    // TODO Add support for account transactions.
    const type: UpdateType = location.state;
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
            authorizedKeyIndex: authorizedVerifyKeyIndex,
        };

        // Forward the transaction under creation to the signing page.
        dispatch(
            push({
                pathname: routes.MULTISIGTRANSACTIONS_SIGN_TRANSACTION,
                state: stringify(signInput),
            })
        );
    }

    async function validateAuthorizationKey(authorizationKey?: string) {
        if (blockSummary && authorizationKey) {
            const authorizedKeyIndices = handler.getAuthorization(
                blockSummary.updates.authorizations
            ).authorizedKeys;

            const matchingKey = blockSummary.updates.authorizations.keys
                .map((key, index) => {
                    return { index, key };
                })
                .filter((key) => {
                    return authorizedKeyIndices.includes(key.index);
                })
                .find((indexedKey) => {
                    return indexedKey.key.verifyKey === authorizationKey;
                });

            if (!matchingKey) {
                throw new Error(
                    'The used public-key is not authorized for this update type.'
                );
            }

            setAuthorizedVerifyKeyIndex(matchingKey.index);
        }
    }

    async function exportPublicKey(
        ledger: ConcordiumLedgerClient,
        setMessage: (message: string) => void
    ) {
        setMessage(
            'Export your public-key to verify that it is an authorized key.'
        );
        // TODO Purpose will quite likely be dynamically set based on the update type,
        // when the update authorization transactions have been re-done.
        setPublicKey(
            (
                await ledger.getPublicKey(
                    getGovernancePath({ purpose: 0, keyIndex: 0 })
                )
            ).toString('hex')
        );
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
                {publicKey && (
                    <DynamicModal
                        execution={() => validateAuthorizationKey(publicKey)}
                        onError={() => {
                            dispatch(
                                push({ pathname: routes.MULTISIGTRANSACTIONS })
                            );
                        }}
                        onSuccess={() => {}}
                        title="Unauthorized key"
                        content="The key you are using to sign with is not authorized for this type of update"
                    />
                )}
                <Segment>
                    <Header>Transaction Proposal | {displayType}</Header>
                    <Divider />
                    {!publicKey && blockSummary && (
                        <>
                            Please export your public-key, to verify that it is
                            authorized for this update.
                            <LedgerComponent ledgerCall={exportPublicKey} />
                        </>
                    )}
                    {blockSummary ? (
                        <EffectiveTimeUpdate
                            UpdateProposalComponent={UpdateComponent}
                            blockSummary={blockSummary}
                            setProposal={setProposal}
                            setDisabled={setDisabled}
                        />
                    ) : null}
                    <Divider horizontal hidden />
                    <Button
                        size="large"
                        primary
                        disabled={!proposal || disabled}
                        onClick={() => {
                            if (proposal) {
                                forwardTransactionToSigningPage(proposal);
                            }
                        }}
                    >
                        Continue
                    </Button>
                </Segment>
            </Segment>
        </>
    );
}
