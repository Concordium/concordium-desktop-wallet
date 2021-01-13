import React from 'react';
import { FoundationTransactionTypes } from '../components/multisig/MultiSignatureProposalView';
import UpdateMicroGtuPerEuroRate from '../components/multisig/UpdateMicroGtuPerEuro';
import styles from './../components/multisig/Multisignature.css';

export default function MultiSignatureProposalPage(props: any) {

    // FIXME This could also be something that is not a foundation transaction!
    function chooseProposalType(type: FoundationTransactionTypes) {
        switch (type) {
            case FoundationTransactionTypes.UpdateMicroGtuPerEuroRate:
                return <h3>Awesome type</h3>;
            case FoundationTransactionTypes.UpdateEuroEnergyRate:
                return <h3>Nice type</h3>;
            default:
                return <UpdateMicroGtuPerEuroRate />;
        }
    }

    return (
        <div className={styles.box}>
            <h1>Add the proposal details</h1>
            <p>Add all the details for the {props.match.params.type} proposal below, and generate your transaction proposal.</p>
            {chooseProposalType(props.match.params.type)}
        </div>
    );
}
