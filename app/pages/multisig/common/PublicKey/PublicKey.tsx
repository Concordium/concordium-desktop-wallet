import React from 'react';
import { chunkString } from '~/utils/basicHelpers';
import styles from './PublicKey.module.scss';

export type PublicKeyProps = {
    name: string;
    publicKey: string;
};

export default function PublicKey({ name, publicKey }: PublicKeyProps) {
    return (
        <>
            <b>{name}</b>
            <p className={styles.key}>
                {chunkString(publicKey, 32).join('\n')}
            </p>
        </>
    );
}
