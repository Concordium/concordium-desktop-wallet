import React from 'react';
import { useSelector } from 'react-redux';
import ButtonNavLink from '~/components/ButtonNavLink';
import { ExportKeyType } from '~/utils/types';
import { foundationTransactionsEnabledSelector } from '../../../features/SettingsSlice';
// eslint-disable-next-line import/no-cycle
import { selectedExportKeyRoute } from '../../../utils/routerHelper';
import styles from '../MultiSignaturePage/MultiSignaturePage.module.scss';

const exportKeyOptionMap = new Map<ExportKeyType, string>([
    [ExportKeyType.Root, 'Governance root key'],
    [ExportKeyType.Level1, 'Governance level 1 key'],
    [ExportKeyType.Level2, 'Governance level 2 key'],
    [ExportKeyType.Credential, 'Account credentials'],
    [ExportKeyType.Genesis, 'Genesis account'],
]);

export function getKeyDisplay(keyType: ExportKeyType): string | undefined {
    return exportKeyOptionMap.get(keyType);
}

/**
 * Displays a list a possible exports of "keys". This can be governance keys, if
 * foundation transactions have been turned on, or account credentials to be added
 * to external accounts.
 */
export default function ExportKeyList(): JSX.Element {
    const foundationTransactionsEnabled: boolean = useSelector(
        foundationTransactionsEnabledSelector
    );

    let keyTypes = Array.from(exportKeyOptionMap);
    if (!foundationTransactionsEnabled) {
        keyTypes = keyTypes.filter(
            ([keyType]) =>
                keyType !== ExportKeyType.Root &&
                keyType !== ExportKeyType.Level1 &&
                keyType !== ExportKeyType.Level2 &&
                keyType !== ExportKeyType.Genesis
        );
    }

    return (
        <>
            {keyTypes.map(([keyType, label]) => {
                return (
                    <ButtonNavLink
                        className={styles.link}
                        key={keyType}
                        to={selectedExportKeyRoute(keyType)}
                    >
                        {label}
                    </ButtonNavLink>
                );
            })}
        </>
    );
}
