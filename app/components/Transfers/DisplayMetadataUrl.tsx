import clsx from 'clsx';
import React from 'react';

import styles from './transferDetails.module.scss';

interface Props {
    metadataUrl: string | undefined;
    placeholder?: boolean;
}

export default function DisplayMetadataUrl({
    metadataUrl,
    placeholder = false,
}: Props) {
    if (metadataUrl === undefined && !placeholder) {
        return null;
    }

    return (
        <>
            <h5 className={styles.title}>Metadata URL:</h5>
            {metadataUrl ? (
                <p className={styles.amount}>{metadataUrl}</p>
            ) : (
                <p className={clsx(styles.amount, 'textFaded')}>
                    {metadataUrl === '' ? 'Empty' : 'To be determined'}
                </p>
            )}
        </>
    );
}
