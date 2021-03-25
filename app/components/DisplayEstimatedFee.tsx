import React from 'react';
import { displayAsGTU } from '~/utils/gtu';

interface Props {
    estimatedFee: bigint | string | undefined;
}
/**
 * Component, that will display estimatedFee.
 */
export default function DisplayEstimatedFee({ estimatedFee }: Props) {
    let fee;
    if (estimatedFee) {
        fee = displayAsGTU(estimatedFee);
    } else {
        fee = 'To be determined';
    }
    return <p>Estimated fee: {fee}</p>;
}
