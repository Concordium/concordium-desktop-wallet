import React from 'react';
import { displayAsGTU } from '~/utils/gtu';

interface Props {
    estimatedFee: bigint | string | undefined;
    className?: string;
}
/**
 * Component, that will display estimatedFee.
 */
export default function DisplayEstimatedFee({
    estimatedFee,
    className,
}: Props) {
    let fee;
    if (estimatedFee) {
        fee = displayAsGTU(estimatedFee);
    } else {
        fee = 'To be determined';
    }
    return <p className={className}>Estimated fee: {fee}</p>;
}
