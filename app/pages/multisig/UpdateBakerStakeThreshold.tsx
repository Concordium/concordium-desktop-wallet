import React, { useEffect, useState } from 'react';
import { onlyDigitsNoLeadingZeroes } from '~/utils/basicHelpers';
import Input from '../../components/Form/Input';
import { createUpdateMultiSignatureTransaction } from '../../utils/MultiSignatureTransactionHelper';
import { UpdateProps } from '../../utils/transactionTypes';
import { UpdateType } from '../../utils/types';

const errorText =
    'The input was invalid. Provide an integer between 0 and 18446744073709551615';

/**
 * Component for creating a baker stake threshold update.
 */
export default function UpdateBakerStakeThreshold({
    blockSummary,
    effectiveTime,
    setProposal,
}: UpdateProps): JSX.Element | null {
    const [error, setError] = useState<string | undefined>();

    const currentBakerStakeThreshold =
        blockSummary.updates.chainParameters.minimumThresholdForBaking;
    const sequenceNumber =
        blockSummary.updates.updateQueues.bakerStakeThreshold
            .nextSequenceNumber;
    const {
        threshold,
    } = blockSummary.updates.authorizations.bakerStakeThreshold;

    const [bakerStakeThreshold, setBakerStakeThreshold] = useState(
        currentBakerStakeThreshold.toString()
    );

    /**
     * Update the baker stake threshoild based on the input given. If the input
     * is invalid, then set an error state with a description of the bad input.
     */
    function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
        const input = e.target.value;
        setBakerStakeThreshold(input);

        if (!onlyDigitsNoLeadingZeroes(input)) {
            setError(errorText);
            return;
        }

        const bigintThreshold = BigInt(input);
        if (bigintThreshold > 18446744073709551615n || bigintThreshold < 0) {
            setError(errorText);
        } else {
            setError(undefined);
        }
    }

    useEffect(() => {
        if (!error && effectiveTime) {
            setProposal(
                createUpdateMultiSignatureTransaction(
                    { threshold: BigInt(bakerStakeThreshold) },
                    UpdateType.UpdateBakerStakeThreshold,
                    sequenceNumber,
                    threshold,
                    effectiveTime
                )
            );
        } else {
            setProposal(undefined);
        }
    }, [
        bakerStakeThreshold,
        sequenceNumber,
        threshold,
        setProposal,
        effectiveTime,
        error,
    ]);

    return (
        <>
            <h3>Current baker stake threshold (µGTU)</h3>
            <Input readOnly value={currentBakerStakeThreshold.toString()} />
            <h3>New baker stake threshold (µGTU)</h3>
            <Input
                value={bakerStakeThreshold}
                onChange={onInputChange}
                error={error}
            />
        </>
    );
}
