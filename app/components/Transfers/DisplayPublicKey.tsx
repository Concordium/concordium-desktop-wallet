import React from 'react';
import { chunkString } from '~/utils/basicHelpers';
import styles from './transferDetails.module.scss';

export type Props = {
    name: string;
    publicKey: string;
};

export default function DisplayPublicKey({ name, publicKey }: Props) {
    return (
        <>
            <h5 className={styles.title}>{name}</h5>
            <div className={styles.address}>
                {chunkString(publicKey, 32).join('\n')}
            </div>
        </>
    );
}
