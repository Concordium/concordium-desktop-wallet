import React from 'react';
import { useSelector } from 'react-redux';
import FingerprintIcon from '@resources/svg/fingerprint.svg';
import IdentityIcon from '@resources/svg/identity.svg';
import ImportExportIcon from '@resources/svg/import-export.svg';
import MultiSigIcon from '@resources/svg/multisig.svg';
import SettingsIcon from '@resources/svg/settings.svg';
import Sidebar, { SidebarLink } from '~/cross-app-components/Sidebar';
import routes from '~/constants/routes.json';
import pkg from '~/package.json';
import { RootState } from '~/store/store';
import { getCcdSymbol } from '~/utils/ccd';

import Status from '../Status';

import styles from './Sidebar.module.scss';

const links: SidebarLink[] = [
    {
        route: routes.ACCOUNTS,
        title: 'Accounts',
        icon: <div className={styles.ccdIcon}>{getCcdSymbol()}</div>,
    },
    {
        route: routes.IDENTITIES,
        title: 'Identities',
        icon: <FingerprintIcon height="34" />,
    },
    {
        route: routes.ADDRESSBOOK,
        title: 'Address book',
        icon: <IdentityIcon height="25" />,
    },
    {
        route: routes.EXPORTIMPORT,
        title: 'Export/Import',
        icon: <ImportExportIcon height="34" />,
    },
    {
        route: routes.MULTISIGTRANSACTIONS,
        title: 'Multi signature transactions',
        icon: <MultiSigIcon height="32" />,
    },
    {
        route: routes.SETTINGS,
        title: 'Settings',
        icon: <SettingsIcon height="36" />,
    },
];

export default function ConnectedSidebar() {
    const disabled = useSelector(
        (s: RootState) => !s.misc.unlocked || !s.misc.termsAccepted
    );

    let statusComponents;
    if (!disabled) {
        statusComponents = <Status />;
    }

    return (
        <Sidebar
            disabled={disabled}
            links={links}
            version={pkg.version}
            child={statusComponents}
        />
    );
}
