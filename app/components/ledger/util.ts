import lt from 'semver/functions/lt';
import valid from 'semver/functions/valid';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import { AppAndVersion } from '~/features/ledger/GetAppAndVersion';
import ledgerConstants from '~/constants/ledgerConstants.json';

export enum LedgerStatusType {
    DISCONNECTED,
    ERROR,
    CONNECTED,
    OUTDATED,
    OPEN_APP,
    LOADING,
    AWAITING_USER_INPUT,
}

export type LedgerCallback<ReturnType = void> = (
    client: ConcordiumLedgerClient,
    setStatusText: (message: string | JSX.Element) => void
) => Promise<ReturnType>;

export type LedgerSubmitHandler = () => Promise<void>;

export function isConcordiumApp({ name }: AppAndVersion) {
    return name === 'Concordium';
}

export function isOutdated({ version }: AppAndVersion) {
    const currentVersion = valid(version);
    if (!currentVersion) {
        throw new Error('Invalid version');
    }
    return lt(currentVersion, ledgerConstants.requiredVersion);
}
