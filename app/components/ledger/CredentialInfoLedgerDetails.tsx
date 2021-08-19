/* eslint-disable react/destructuring-assignment */
import React from 'react';
import { formatDate } from '~/utils/timeHelpers';
import { UnsignedCredentialDeploymentInformation } from '~/utils/types';

interface Props extends UnsignedCredentialDeploymentInformation {
    address?: string;
}

const CredentialInfoLedgerDetails = (props: Props) => (
    <div className="textLeft">
        <p className="mT0">Please confirm details on ledger:</p>
        <p>
            <b>Public key:</b> {props.credentialPublicKeys.keys[0].verifyKey}
        </p>
        <p>
            <b>Signature threshold:</b> {props.credentialPublicKeys.threshold}
        </p>
        <p>
            <b>Credential Identifier (CredId):</b> {props.credId}
        </p>
        <p>
            <b>Anonymity revocation threshold (AR threshold):</b>{' '}
            {props.revocationThreshold}
        </p>
        <p>
            <b>Identity Valid atleast to (Id Valid to &gt;=):</b>{' '}
            {formatDate(props.policy.validTo)}
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
