import { Authorization, Authorizations } from '~/node/NodeApiTypes';
import {
    AccessStructure,
    AccessStructureEnum,
    AuthorizationKeysUpdate,
    KeyIndexWithStatus,
    KeyUpdateEntryStatus,
} from '~/utils/types';

export function getAccessStructureTitle(
    accessStructureType: AccessStructureEnum
) {
    switch (accessStructureType) {
        case AccessStructureEnum.emergency:
            return 'Emergency';
        case AccessStructureEnum.protocol:
            return 'Protocol update';
        case AccessStructureEnum.electionDifficulty:
            return 'Election difficulty';
        case AccessStructureEnum.euroPerEnergy:
            return 'Euro per energy';
        case AccessStructureEnum.microGtuPerEuro:
            return 'Micro GTU per Euro';
        case AccessStructureEnum.foundationAccount:
            return 'Foundation account';
        case AccessStructureEnum.mintDistribution:
            return 'Mint distribution';
        case AccessStructureEnum.transactionFeeDistribution:
            return 'Transaction fee distribution';
        case AccessStructureEnum.gasRewards:
            return 'GAS rewards';
        case AccessStructureEnum.bakerStakeThreshold:
            return 'Baker stake threshold';
        case AccessStructureEnum.addAnonymityRevoker:
            return 'Add anonymity revoker';
        case AccessStructureEnum.addIdentityProvider:
            return 'Add identity provider';
        default:
            throw new Error(
                `Unknown access structure type: ${accessStructureType}`
            );
    }
}

function unchangedIndex(index: number): KeyIndexWithStatus {
    return {
        status: KeyUpdateEntryStatus.Unchanged,
        index,
    };
}

function mapAuthorizationToAccessStructure(
    authorization: Authorization,
    type: AccessStructureEnum
) {
    const accessStructure: AccessStructure = {
        publicKeyIndicies: authorization.authorizedKeys.map((index) =>
            unchangedIndex(index)
        ),
        threshold: authorization.threshold,
        type,
    };
    return accessStructure;
}

export function mapCurrentAuthorizationsToUpdate(
    authorizations: Authorizations
) {
    const accessStructures = [
        mapAuthorizationToAccessStructure(
            authorizations.emergency,
            AccessStructureEnum.emergency
        ),
        mapAuthorizationToAccessStructure(
            authorizations.protocol,
            AccessStructureEnum.protocol
        ),
        mapAuthorizationToAccessStructure(
            authorizations.electionDifficulty,
            AccessStructureEnum.electionDifficulty
        ),
        mapAuthorizationToAccessStructure(
            authorizations.euroPerEnergy,
            AccessStructureEnum.euroPerEnergy
        ),
        mapAuthorizationToAccessStructure(
            authorizations.microGTUPerEuro,
            AccessStructureEnum.microGtuPerEuro
        ),
        mapAuthorizationToAccessStructure(
            authorizations.foundationAccount,
            AccessStructureEnum.foundationAccount
        ),
        mapAuthorizationToAccessStructure(
            authorizations.mintDistribution,
            AccessStructureEnum.mintDistribution
        ),
        mapAuthorizationToAccessStructure(
            authorizations.transactionFeeDistribution,
            AccessStructureEnum.transactionFeeDistribution
        ),
        mapAuthorizationToAccessStructure(
            authorizations.paramGASRewards,
            AccessStructureEnum.gasRewards
        ),
        mapAuthorizationToAccessStructure(
            authorizations.bakerStakeThreshold,
            AccessStructureEnum.bakerStakeThreshold
        ),
        mapAuthorizationToAccessStructure(
            authorizations.addAnonymityRevoker,
            AccessStructureEnum.addAnonymityRevoker
        ),
        mapAuthorizationToAccessStructure(
            authorizations.addIdentityProvider,
            AccessStructureEnum.addIdentityProvider
        ),
    ];

    const update: AuthorizationKeysUpdate = {
        // TODO The key update type has to be dynamic here.
        keyUpdateType: 2,
        keys: authorizations.keys,
        accessStructures,
    };
    return update;
}
