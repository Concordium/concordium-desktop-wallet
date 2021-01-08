import React from 'react';
import { useSelector } from 'react-redux';
import { chosenMenuSelector } from '../../features/MultiSignatureSlice';
import styles from './Multisignature.css';

export default function MultisignatureView() {
    const chosenMenu = useSelector(chosenMenuSelector)

    if (chosenMenu === undefined) {
        return <div/>
    }
    
    return (
        <div className={styles.halfPage}>
            {chosenMenu.item}
        </div>
    );
}
