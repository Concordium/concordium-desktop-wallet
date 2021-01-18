import { push } from 'connected-react-router';
import React from 'react';
import { useDispatch } from 'react-redux';
import styles from './Multisignature.css';
import routes from '../../constants/routes.json';
import { updateCurrentProposal } from '../../features/MultiSignatureSlice';
import { UpdateHeader, UpdateInstruction } from '../../utils/types';

/**
 * Update type enumeration. The numbering is important as that corresponds
 * to the byte written when serializing the update instruction/
 */
enum UpdateType {
    UpdateAuthorization = 0,
    UpdateProtocol = 1,
    UpdateElectionDifficulty = 2,
    UpdateEuroPerEnergy = 3,
    UpdateMicroGTUPerEuro = 4,
    UpdateFoundationAccount = 5,
    UpdateMintDistribution = 6,
    UpdateTransactionFeeDistribution = 7,
    UpdateGASRewards = 8
}

export interface ExchangeRate {
    // Word 64
    numerator: number;
    // Word 64  
    denominator: number;
}

/**
 * The model for multi signature transaction proposals, which maps into the 
 * database model as well. 
 */
export interface MultiSignatureTransaction {
    // The JSON serialization of the transaction
    transaction: string;
    // The type of transaction
    type: string;
    // The list of signatures that have been received
    // for the transaction so far.
    // Do we need this, or could it be inside the transaction? But it would differ depending on AccountTransaction vs. UpdateInstruction.
    signatures: string[];
    // The minimum required signatures for the transaction
    // to be accepted on chain.
    threshold: number;
}

// Generate transaction proposal, should the proposer be the first to sign it? I think that makes sense if that were to be the case.


/**
 * Test function for generating a static update instruction. This should happen dynamically based on the 
 * transaction that is currently being created by the user.
 */
function generateUpdateInstruction(): MultiSignatureTransaction {
    const exchangeRatePayload: ExchangeRate = {
        numerator: 10000,
        denominator: 1
    }

    // Payload size is statically 17 for ExchangeRate transaction types.
    const updateHeader: UpdateHeader = { 
        effectiveTime: 0,
        payloadSize: 17,
        sequenceNumber: 0,
        timeout: 0
    }

    const updateInstruction: UpdateInstruction = {
        header: updateHeader,
        payload: exchangeRatePayload,
        signatures: [],
    }

    const transaction: MultiSignatureTransaction = {
        transaction: JSON.stringify(updateInstruction),
        threshold: 3,
        signatures: [],
        type: 'UpdateMicroGtuPerEuro',
    }

    return transaction;
}

export default function UpdateMicroGtuPerEuroRate() {
    const dispatch = useDispatch();

    function onClick() {
        // Set the current proposal in the state to the one that was just generated.
        updateCurrentProposal(dispatch, generateUpdateInstruction());

        // Navigate to the page that displays the current proposal from the state.
        dispatch(push(routes.MULTISIGTRANSACTIONS_PROPOSAL_EXISTING));
    }

    return (
        <div className={styles.centering}>
            <div className={styles.subbox}>
                <h3>Transaction Proposal | Update MicroGTU Per Euro</h3>
                <hr></hr>
                <div>
                    <h4 className={styles.readonly}>Current MicroGTU Per Euro Rate:</h4>
                    <h2 className={styles.readonly}>€ 1.00 = µǤ 1323</h2>
                </div>
                <div>
                    <h4 className={styles.readonly}>New MicroGTU Per Euro Rate:</h4>
                    <input placeholder="€ 1.00 = µǤ 1338" className={styles.readonly}></input>
                </div>
            </div>
            <div className={styles.test}>
                <button type="button" onClick={() => onClick()}>Generate Transaction Proposal</button>
            </div>
        </div>
    );
}
