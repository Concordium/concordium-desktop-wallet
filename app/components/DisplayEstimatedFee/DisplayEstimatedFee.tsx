import React from 'react';
import clsx from 'clsx';
import { displayAsCcd } from '~/utils/ccd';
import { Fraction } from '~/utils/types';
import { collapseFraction } from '~/utils/basicHelpers';

import styles from './DisplayEstimatedFee.module.scss';

interface Props {
    estimatedFee: Fraction | undefined;
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
        fee = displayAsCcd(collapseFraction(estimatedFee));
    } else {
        fee = 'To be determined';
    }
    return (
        <p className={clsx(styles.root, 'mono', className)}>
            Estimated fee: {fee}
        </p>
    );
}
