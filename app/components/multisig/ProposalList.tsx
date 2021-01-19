import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loadProposals, proposalsSelector } from '../../features/MultiSignatureSlice';
import styles from './Multisignature.css';

/**
 * Component that displays a list of multi signature transaction proposals.
 */
export default function ProposalList() {
    const dispatch = useDispatch();
    const proposals = useSelector(proposalsSelector);

    useEffect(() => {
        loadProposals(dispatch);
    }, []);

    return (
        <div>
            {proposals.map((proposal) => {
                return <div className={styles.menuitem}>{proposal.transaction}</div>
            })}
        </div>
    )
}
