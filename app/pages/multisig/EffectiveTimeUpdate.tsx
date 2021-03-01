import { stringify } from 'json-bigint';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Button, Divider, Header } from 'semantic-ui-react';
import { push } from 'connected-react-router';
import InputTimeStamp from '../../components/InputTimeStamp';
import { getNow, TimeConstants } from '../../utils/timeHelpers';
import { UpdateComponent } from '../../utils/transactionTypes';
import { MultiSignatureTransaction } from '../../utils/types';
import routes from '../../constants/routes.json';
import { BlockSummary } from '../../utils/NodeApiTypes';

interface Props {
    UpdateProposalComponent: UpdateComponent;
    blockSummary: BlockSummary;
}

/**
 * Component for an update component that includes a time picker to set the
 * effective time for the update that is being created, and the button
 * for continuing with the generation of the proposal.
 */
export default function EffectiveTimeUpdate({
    UpdateProposalComponent,
    blockSummary,
}: Props): JSX.Element {
    const dispatch = useDispatch();
    const [effectiveTime, setEffectiveTime] = useState<number>(
        getNow() + 5 * TimeConstants.Minute
    );
    const [proposal, setProposal] = useState<
        Partial<MultiSignatureTransaction>
    >();
    const [disabled, setDisabled] = useState(false);

    /**
     * Forwards the multi signature transactions to the signing page.
     */
    async function forwardTransactionToSigningPage(
        multiSignatureTransaction: Partial<MultiSignatureTransaction>
    ) {
        dispatch(
            push({
                pathname: routes.MULTISIGTRANSACTIONS_SIGN_TRANSACTION,
                state: stringify(multiSignatureTransaction),
            })
        );
    }

    return (
        <>
            <UpdateProposalComponent
                blockSummary={blockSummary}
                effectiveTime={BigInt(effectiveTime)}
                setProposal={setProposal}
                setDisabled={setDisabled}
            />
            <Header>Effective time</Header>
            <InputTimeStamp
                placeholder="Enter effective time"
                value={effectiveTime}
                setValue={setEffectiveTime}
            />
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
        </>
    );
}
