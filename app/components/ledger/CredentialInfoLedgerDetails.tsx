/* eslint-disable react/destructuring-assignment */
import React from 'react';
import { formatDate } from '~/utils/timeHelpers';
import { UnsignedCredentialDeploymentInformation } from '~/utils/types';
import DisplayHexString from './DisplayHexString';
import PublicKeyDetails from './PublicKeyDetails';
import DisplayAddress from '../DisplayAddress';

interface Props extends UnsignedCredentialDeploymentInformation {
    address?: string;
}

const CredentialInfoLedgerDetails = (props: Props) => (
    <div className="textLeft">
        <p className="mT0">Please confirm details on ledger:</p>
        <p>
            <b>Public key:</b>
            <PublicKeyDetails
                className="mV40"
                publicKey={props.credentialPublicKeys.keys[0].verifyKey}
            />
        </p>
        <p>
            <b>Signature threshold:</b> {props.credentialPublicKeys.threshold}
        </p>
        <p>
            <b>Registration ID credential (RegIdCred):</b>
            <DisplayHexString className="mV40" value={props.credId} />
        </p>
        <p>
            <b>Identity provider:</b> {props.ipIdentity}
        </p>
        <p>
            <b>Revocation threshold:</b> {props.revocationThreshold}
        </p>
        <p>
            <b>Valid to:</b> {formatDate(props.policy.validTo)}
        </p>
        <p>
            <b>Created at:</b> {formatDate(props.policy.createdAt)}
        </p>
        {props.address && (
            <>
                <b>Account address:</b>
                <DisplayAddress address={props.address} />
            </>
        )}
    </div>
);

export default CredentialInfoLedgerDetails;
