import React from 'react';
import Loading from '~/cross-app-components/Loading';
import {
    AccessStructure,
    AuthorizationKeysUpdate,
    UpdateType,
    VerifyKey,
} from '~/utils/types';
import withChainData, { ChainData } from '../../common/withChainData';

interface Props extends ChainData {
    authorizationKeysUpdate: AuthorizationKeysUpdate;
    type: UpdateType;
}

function findKeysForAccessStructure(
    accessStructure: AccessStructure,
    keys: VerifyKey[]
): VerifyKey[] {
    return keys
        .map((key, index) => {
            return { key, index };
        })
        .filter((result) =>
            accessStructure.publicKeyIndicies
                .map((idx) => idx.index)
                .includes(result.index)
        )
        .map((result) => result.key);
}

function accessStructureView(
    accessStructure: AccessStructure,
    title: string,
    keys: VerifyKey[]
) {
    const keysInStructure = findKeysForAccessStructure(accessStructure, keys);
    return (
        <div>
            <h2>{title}</h2>
            <p>Threshold: {accessStructure.threshold}</p>
            <ul>
                {keysInStructure.map((key) => {
                    return <li key={key.verifyKey}>{key.verifyKey}</li>;
                })}
            </ul>
        </div>
    );
}

/**
 * Displays an overview of an authorization keys update.
 */
function AuthorizationKeysView({
    authorizationKeysUpdate,
    type,
    blockSummary,
}: Props) {
    if (!blockSummary) {
        return <Loading inline />;
    }

    return (
        <>
            {type}
            {accessStructureView(
                authorizationKeysUpdate.emergency,
                'Emergency',
                authorizationKeysUpdate.keys
            )}
            {accessStructureView(
                authorizationKeysUpdate.protocol,
                'Protocol update',
                authorizationKeysUpdate.keys
            )}
            {accessStructureView(
                authorizationKeysUpdate.electionDifficulty,
                'Election difficulty',
                authorizationKeysUpdate.keys
            )}
            {accessStructureView(
                authorizationKeysUpdate.euroPerEnergy,
                'Euro per energy',
                authorizationKeysUpdate.keys
            )}
            {accessStructureView(
                authorizationKeysUpdate.microGtuPerEuro,
                'Micro GTU per Euro',
                authorizationKeysUpdate.keys
            )}
            {accessStructureView(
                authorizationKeysUpdate.foundationAccount,
                'Foundation account',
                authorizationKeysUpdate.keys
            )}
            {accessStructureView(
                authorizationKeysUpdate.mintDistribution,
                'Mint distribution',
                authorizationKeysUpdate.keys
            )}
            {accessStructureView(
                authorizationKeysUpdate.transactionFeeDistribution,
                'Transaction fee distribution',
                authorizationKeysUpdate.keys
            )}
            {accessStructureView(
                authorizationKeysUpdate.gasRewards,
                'GAS rewards',
                authorizationKeysUpdate.keys
            )}
            {accessStructureView(
                authorizationKeysUpdate.bakerStakeThreshold,
                'Baker stake threshold',
                authorizationKeysUpdate.keys
            )}
            {accessStructureView(
                authorizationKeysUpdate.addAnonymityRevoker,
                'Add anonymity revoker',
                authorizationKeysUpdate.keys
            )}
            {accessStructureView(
                authorizationKeysUpdate.addIdentityProvider,
                'Add identity provider',
                authorizationKeysUpdate.keys
            )}
        </>
    );
}

export default withChainData(AuthorizationKeysView);
