import React from 'react';
import { MultiSignatureTransaction } from '~/utils/types';
import styles from './ProposalViewStatusText.module.scss';

type ProposalViewStatusTextProps = MultiSignatureTransaction;

export default function ProposalViewStatusText({
    status,
}: ProposalViewStatusTextProps): JSX.Element {
    return (
        <div>
            <h5 className="mB0">Status</h5>
            <span className={styles.statusText}>{status}</span>
        </div>
    );
}
