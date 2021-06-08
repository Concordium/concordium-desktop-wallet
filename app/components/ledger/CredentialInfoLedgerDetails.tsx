/* eslint-disable react/destructuring-assignment */
import React from 'react';
import { formatDate } from '~/utils/timeHelpers';
import { UnsignedCredentialDeploymentInformation } from '~/utils/types';

interface Props extends UnsignedCredentialDeploymentInformation {
    address?: string;
}

const CredentialInfoLedgerDetails = (props: Props) => (
    <div className="textLeft">
        <p className="mT0">
            <b>Public key:</b> {props.credentialPublicKeys.keys[0].verifyKey}
        </p>
        <p>
            <b>Signature threshold:</b> {props.credentialPublicKeys.threshold}
        </p>
        <p>
            <b>Registration ID credential (RegIdCred):</b> {props.credId}
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
            <p>
                <b>Account address:</b> {props.address}
            </p>
        )}
    </div>
);

export default CredentialInfoLedgerDetails;
