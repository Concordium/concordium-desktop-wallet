import { Authorization, Authorizations } from '~/node/NodeApiTypes';
import {
    AccessStructure,
    AuthorizationKeysUpdate,
    KeyIndexWithStatus,
    KeyUpdateEntryStatus,
} from '~/utils/types';

function unchangedIndex(index: number): KeyIndexWithStatus {
    return {
        status: KeyUpdateEntryStatus.Unchanged,
        index,
    };
}

function mapAuthorizationToAccessStructure(authorization: Authorization) {
    const accessStructure: AccessStructure = {
        publicKeyIndicies: authorization.authorizedKeys.map((index) =>
            unchangedIndex(index)
        ),
        threshold: authorization.threshold,
    };
    return accessStructure;
}

export default function mapCurrentAuthorizationsToUpdate(
    authorizations: Authorizations
) {
    const update: AuthorizationKeysUpdate = {
        // TODO The key update type has to be dynamic here.
        keyUpdateType: 2,
        keys: authorizations.keys,
        emergency: mapAuthorizationToAccessStructure(authorizations.emergency),
        protocol: mapAuthorizationToAccessStructure(authorizations.protocol),
        electionDifficulty: mapAuthorizationToAccessStructure(
            authorizations.electionDifficulty
        ),
        euroPerEnergy: mapAuthorizationToAccessStructure(
            authorizations.euroPerEnergy
        ),
        microGtuPerEuro: mapAuthorizationToAccessStructure(
            authorizations.microGTUPerEuro
        ),
        foundationAccount: mapAuthorizationToAccessStructure(
            authorizations.foundationAccount
        ),
        mintDistribution: mapAuthorizationToAccessStructure(
            authorizations.mintDistribution
        ),
        transactionFeeDistribution: mapAuthorizationToAccessStructure(
            authorizations.transactionFeeDistribution
        ),
        gasRewards: mapAuthorizationToAccessStructure(
            authorizations.paramGASRewards
        ),
        bakerStakeThreshold: mapAuthorizationToAccessStructure(
            authorizations.bakerStakeThreshold
        ),
        addAnonymityRevoker: mapAuthorizationToAccessStructure(
            authorizations.addAnonymityRevoker
        ),
        addIdentityProvider: mapAuthorizationToAccessStructure(
            authorizations.addIdentityProvider
        ),
    };
    return update;
}
