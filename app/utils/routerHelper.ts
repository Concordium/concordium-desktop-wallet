import routes from '../constants/routes.json';
// eslint-disable-next-line import/no-cycle
import { ExportKeyType } from '~/pages/multisig/menu/ExportKeyList';

export const selectedAddressBookEntryRoute = (address: string) =>
    routes.ADDRESSBOOK_SELECTED.replace(':address', address);

export const selectedProposalRoute = (id: number) =>
    routes.MULTISIGTRANSACTIONS_PROPOSAL_EXISTING_SELECTED.replace(
        ':id',
        `${id}`
    );

export const submittedProposalRoute = (id: number) =>
    routes.MULTISIGTRANSACTIONS_SUBMITTED_TRANSACTION.replace(':id', `${id}`);

export function selectedExportKeyRoute(keyType: string) {
    if (keyType === ExportKeyType.Credential) {
        return routes.GENERATE_CREDENTIAL;
    }
    return routes.MULTISIGTRANSACTIONS_EXPORT_KEY_SELECTED.replace(
        ':keyType',
        keyType
    );
}

export const createProposalRoute = (updateType: number) =>
    routes.MULTISIGTRANSACTIONS_PROPOSAL.replace(
        ':updateType',
        `${updateType}`
    );
