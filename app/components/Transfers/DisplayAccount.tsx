import React from 'react';
import { partialApply } from '~/utils/componentHelpers';
import DisplayAddress from '../DisplayAddress';

import styles from './transferDetails.module.scss';

interface Props {
    label: string;
    name?: string;
    address: string;
    note?: string;
}

export default function DisplayAccount({ label, name, address, note }: Props) {
    return (
        <>
            <h5 className={styles.title}>{label}</h5>
            {name && (
                <div className="mB10">
                    <p className={styles.name}>{name}</p>
                    {note && <p className={styles.note}>{note}</p>}
                </div>
            )}
            <DisplayAddress
                address={address}
                className={styles.address}
                lineClassName="mH5"
            />
        </>
    );
}

export const DisplayFromAccount = partialApply(DisplayAccount, {
    label: 'From account:',
    note: undefined,
});

export const DisplayToAccount = partialApply(DisplayAccount, {
    label: 'To account:',
});
