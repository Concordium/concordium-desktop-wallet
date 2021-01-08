import React from 'react';
import { chooseMenuItem } from '../../features/MultiSignatureSlice';
import { useDispatch } from 'react-redux';
import styles from './Multisignature.css';

/**
 * An enumeration that contains the menu items available in the menu
 * on the multisignature page.
 */
export enum MultiSignatureMenuItems {
    MakeNewProposal,
    ProposedTransactions,
    SignTransaction,
}

export default function MultiSignatureList() {
    const dispatch = useDispatch();

    return (
        <div className={styles.halfPage}>
            {Object.keys(MultiSignatureMenuItems).filter(key => isNaN(Number(key))).map((item) => (
                <div className={styles.menuitem} role="button" onClick={() => dispatch(chooseMenuItem({ item }))}><h3>{item}</h3></div>
            ))}
        </div>
    );
}
