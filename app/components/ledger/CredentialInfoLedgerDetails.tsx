/* eslint-disable react/destructuring-assignment */
import React from 'react';
import { UnsignedCredentialDeploymentInformation } from '~/utils/types';
import PublicKeyDetails from './PublicKeyDetails';
import DisplayAddress from '../DisplayAddress';

interface Props extends UnsignedCredentialDeploymentInformation {
    address?: string;
}

const CredentialInfoLedgerDetails = (props: Props) => (
    <div className="textLeft">
        <p className="mT0">Please confirm details on ledger:</p>
        <div>
            <b>Public key:</b>
            <PublicKeyDetails
                className="mV40"
                publicKey={props.credentialPublicKeys.keys[0].verifyKey}
            />
        </div>
        <p>
            <b>Signature threshold:</b> {props.credentialPublicKeys.threshold}
        </p>
        <div>
            <b>Authorities required (AR threshold):</b>
            <p className="mT0">
                {props.revocationThreshold} out of{' '}
                {Object.keys(props.arData).length}
            </p>
        </div>
        {props.address && (
            <>
                <b>Account address:</b>
                <DisplayAddress address={props.address} />
            </>
        )}
    </div>
);

export default CredentialInfoLedgerDetails;
