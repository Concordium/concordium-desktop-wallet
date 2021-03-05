import React, { useEffect, useState } from 'react';
import { Header } from 'semantic-ui-react';
import InputTimestamp from '../../components/Form/InputTimestamp';
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

const defaultTime = new Date(getNow() + 5 * TimeConstants.Minute);

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
    const [effectiveTime, setEffectiveTime] = useState<Date | undefined>(
        defaultTime
    );
    const [effectiveTimeInSeconds, setEffectiveTimeInSeconds] = useState<
        number | undefined
    >();

    useEffect(() => {
        setEffectiveTimeInSeconds(
            effectiveTime !== undefined
                ? Math.round(effectiveTime.getTime() / 1000)
                : undefined
        );
    }, [effectiveTime]);

    return (
        <>
            <UpdateProposalComponent
                blockSummary={blockSummary}
                effectiveTime={BigInt(effectiveTimeInSeconds)}
                setProposal={setProposal}
                setDisabled={setDisabled}
            />
            <Header>Effective time</Header>
            <InputTimestamp
                label="Enter effective time"
                value={effectiveTime}
                onChange={setEffectiveTime}
            />
        </>
    );
}
