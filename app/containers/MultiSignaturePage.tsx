import React from 'react';
import MultiSignatureList from '../components/multisig/MultiSignatureList';
import MultisignatureView from '../components/multisig/MultisignatureView';
import styles from './Pages.css';

export default function MultiSignaturePage() {
    return (
        <div className={styles.splitPage}>
            <MultiSignatureList />
            <MultisignatureView />
        </div>
    );
}
