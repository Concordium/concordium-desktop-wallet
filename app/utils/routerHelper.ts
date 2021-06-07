import routes from '../constants/routes.json';
import {
    TransactionTypes,
    UpdateType,
    TransactionKindId,
    ExportKeyType,
} from './types';

export const selectedAddressBookEntryRoute = (address: string) =>
    routes.ADDRESSBOOK_SELECTED.replace(':address', address);

export const selectedSettingRoute = (type: string) =>
    routes.SETTINGS_SELECTED.replace(':type', type);

export const selectedProposalRoute = (proposalId: number) => {
    return routes.MULTISIGTRANSACTIONS_PROPOSAL_EXISTING_SELECTED.replace(
        ':id',
        `${proposalId}`
    );
};

export function selectedExportKeyRoute(keyType: string) {
    if (keyType === ExportKeyType.Credential) {
        return routes.GENERATE_CREDENTIAL;
    }
    if (keyType === ExportKeyType.Genesis) {
        return routes.CREATE_GENESIS_ACCOUNT;
    }
    return routes.MULTISIGTRANSACTIONS_EXPORT_KEY_SELECTED.replace(
        ':keyType',
        keyType
    );
}

export const submittedProposalRoute = (proposalId: number) =>
    routes.MULTISIGTRANSACTIONS_SUBMITTED_TRANSACTION.replace(
        ':id',
        `${proposalId}`
    );

export function createProposalRoute(
    transactionType: TransactionTypes,
    specificType: UpdateType | TransactionKindId
) {
    if (transactionType === TransactionTypes.UpdateInstruction) {
        return routes.MULTISIGTRANSACTIONS_PROPOSAL.replace(
            ':updateType',
            `${specificType}`
        );
    }
    if (transactionType === TransactionTypes.AccountTransaction) {
        return routes.MULTISIGTRANSACTIONS_CREATE_ACCOUNT_TRANSACTION.replace(
            ':transactionKind',
            `${specificType}`
        );
    }
    throw new Error(`Unknown transactionType given:${transactionType}`);
}
