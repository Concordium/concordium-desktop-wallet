import React from 'react';
import { BakerStakeThreshold } from '../../utils/types';

interface Props {
    bakerStakeThreshold: BakerStakeThreshold;
}

/**
 * Displays an overview of a baker stake threshold.
 */
export default function BakerStakeThresholdView({
    bakerStakeThreshold,
}: Props) {
    return (
        <>
            <h3>New baker stake threshold</h3>
            {bakerStakeThreshold.threshold} µGTU
        </>
    );
}
