import React, { ReactNode } from 'react';
import { getFormattedDateString } from '~/utils/timeHelpers';
import styles from './DisplayTransactionExpiryTime.module.scss';

type Props = {
    expiryTime: Date | undefined;
    placeholder?: ReactNode;
};

export default function DisplayTransactionExpiryTime({
    expiryTime,
    placeholder,
}: Props) {
    return (
        <>
            <p className={styles.title}>Transaction expiry time:</p>
            <p className={styles.value}>
                {expiryTime === undefined ? (
                    <span className="textFaded">{placeholder}</span>
                ) : (
                    getFormattedDateString(expiryTime)
                )}
            </p>
        </>
    );
}
