import React from 'react';
import { chunkString } from '~/utils/basicHelpers';
import styles from './transferDetails.module.scss';

export type Props = {
    name: string;
    publicKey: string | undefined;
    placeholder?: boolean;
};

export default function DisplayPublicKey({
    name,
    publicKey,
    placeholder = false,
}: Props) {
    if (!publicKey && !placeholder) {
        return null;
    }

    return (
        <>
            <h5 className={styles.title}>{name}</h5>
            {!publicKey && placeholder && (
                <span className="textFaded">To be determined</span>
            )}
            {publicKey && (
                <div className={styles.address}>
                    {chunkString(publicKey, 32).join('\n')}
                </div>
            )}
        </>
    );
}
