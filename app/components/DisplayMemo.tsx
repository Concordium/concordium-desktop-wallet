import React from 'react';
import clsx from 'clsx';

import styles from './Transfers/transferDetails.module.scss';

interface Props {
    memo?: string;
    fallback?: string;
}

/**
 * Displays a memo. If no memo is given, does not display anything.
 */
export default function DisplayMemo({ memo, fallback }: Props) {
    if (!memo && !fallback) {
        return null;
    }
    return (
        <>
            <h5 className={styles.title}>Memo:</h5>
            <p className={clsx('body2 mT0', memo || 'textFaded')}>
                {memo || fallback}
            </p>
        </>
    );
}
