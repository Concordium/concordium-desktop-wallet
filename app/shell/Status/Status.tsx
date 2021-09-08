import React from 'react';
import LedgerStatus from './LedgerStatus';
import NodeStatus from './NodeStatus';

import styles from './Status.module.scss';

export default function Status() {
    return (
        <div className={styles.outer}>
            <LedgerStatus />
            <NodeStatus />
        </div>
    );
}
