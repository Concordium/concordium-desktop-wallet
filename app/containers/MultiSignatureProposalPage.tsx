import React from 'react';
import { FoundationTransactionTypes } from '../components/multisig/MultiSignatureCreateProposalView';
import UpdateMicroGtuPerEuroRate from '../components/multisig/UpdateMicroGtuPerEuro';
import styles from './../components/multisig/Multisignature.css';

interface Props {
    type: FoundationTransactionTypes
}

export default function MultiSignatureProposalPage({ type }: Props) {
    // FIXME This could also be something that is not a foundation transaction!

    function chooseProposalType(type: FoundationTransactionTypes) {
        console.log(type);
        switch (type) {
            case 4:
                return <UpdateMicroGtuPerEuroRate />;
            case FoundationTransactionTypes.UpdateEuroEnergyRate:
                return <h3>Nice type</h3>;
            default:
                return <div>Invalid!</div>
        }
    }

    return (
        <div className={styles.box}>
            <h1>Add the proposal details</h1>
            <p>Add all the details for the {FoundationTransactionTypes[type]} proposal below, and generate your transaction proposal.</p>
            {chooseProposalType(type)}
        </div>
    );
}
