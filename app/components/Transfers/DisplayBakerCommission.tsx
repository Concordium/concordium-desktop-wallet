import React from 'react';
import { isDefined } from '~/utils/basicHelpers';
import { toFixed } from '~/utils/numberStringHelpers';
import { fractionResolutionToPercentage } from '~/utils/rewardFractionHelpers';

import styles from './transferDetails.module.scss';

interface Props {
    title: string;
    value?: number;
    placeholder?: string;
}

const formatCommission = toFixed(3);

const DisplayBakerCommission = ({ title, value, placeholder }: Props) =>
    value || placeholder ? (
        <>
            <h5 className={styles.title}>{title}:</h5>
            <p className={styles.amount}>
                {!value && placeholder && (
                    <span className="textFaded">{placeholder}</span>
                )}
                {isDefined(value) && (
                    <>
                        {formatCommission(
                            fractionResolutionToPercentage(value).toString()
                        )}
                        %
                    </>
                )}
            </p>
        </>
    ) : null;

export default DisplayBakerCommission;
