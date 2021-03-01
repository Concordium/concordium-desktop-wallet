import React, { useState } from 'react';
import { Header } from 'semantic-ui-react';
import InputTimeStamp from '../../components/InputTimeStamp';
import { getNow, TimeConstants } from '../../utils/timeHelpers';
import { UpdateComponent } from '../../utils/transactionTypes';
import { MultiSignatureTransaction } from '../../utils/types';
import { BlockSummary } from '../../utils/NodeApiTypes';

interface Props {
    UpdateProposalComponent: UpdateComponent;
    blockSummary: BlockSummary;
    setProposal: React.Dispatch<
        React.SetStateAction<Partial<MultiSignatureTransaction> | undefined>
    >;
    setDisabled: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * Component for an update component that includes a time picker to set the
 * effective time for the update that is being created.
 */
export default function EffectiveTimeUpdate({
    UpdateProposalComponent,
    blockSummary,
    setProposal,
    setDisabled,
}: Props): JSX.Element {
    const [effectiveTime, setEffectiveTime] = useState<number>(
        getNow() + 5 * TimeConstants.Minute
    );
    const [
        effectiveTimeInSeconds,
        setEffectiveTimeInSeconds,
    ] = useState<number>(Math.round(effectiveTime / 1000));

    return (
        <>
            <UpdateProposalComponent
                blockSummary={blockSummary}
                effectiveTime={BigInt(effectiveTimeInSeconds)}
                setProposal={setProposal}
                setDisabled={setDisabled}
            />
            <Header>Effective time</Header>
            <InputTimeStamp
                placeholder="Enter effective time"
                value={effectiveTime}
                setValue={(timestamp: number) => {
                    setEffectiveTime(timestamp);
                    setEffectiveTimeInSeconds(Math.round(timestamp / 1000));
                }}
            />
        </>
    );
}
