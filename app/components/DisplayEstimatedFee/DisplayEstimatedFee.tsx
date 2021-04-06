import React from 'react';
import clsx from 'clsx';
import styles from './DisplayEstimatedFee.module.scss';
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
    return <p className={clsx(className, styles.root)}>Estimated fee: {fee}</p>;
}
