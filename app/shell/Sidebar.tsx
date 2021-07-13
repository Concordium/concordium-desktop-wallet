import React from 'react';
import { useSelector } from 'react-redux';
import GtuIcon from '@resources/svg/gtu.svg';
import FingerprintIcon from '@resources/svg/fingerprint.svg';
import IdentityIcon from '@resources/svg/identity.svg';
import ImportExportIcon from '@resources/svg/import-export.svg';
import MultiSigIcon from '@resources/svg/multisig.svg';
import SettingsIcon from '@resources/svg/settings.svg';
import Sidebar, { SidebarLink } from '~/cross-app-components/Sidebar';
import routes from '~/constants/routes.json';
import pkg from '~/package.json';

import LedgerStatus from './LedgerStatus';
import { RootState } from '~/store/store';

const links: SidebarLink[] = [
    {
        route: routes.ACCOUNTS,
        title: 'Accounts',
        icon: <GtuIcon height="32" />,
    },
    {
        route: routes.IDENTITIES,
        title: 'Identities',
        icon: <FingerprintIcon height="34" />,
    },
    {
        route: routes.ADDRESSBOOK,
        title: 'Address Book',
        icon: <IdentityIcon height="25" />,
    },
    {
        route: routes.EXPORTIMPORT,
        title: 'Export/Import',
        icon: <ImportExportIcon height="34" />,
    },
    {
        route: routes.MULTISIGTRANSACTIONS,
        title: 'Multi Signature Transactions',
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

    let ledgerStatus;
    if (!disabled) {
        ledgerStatus = <LedgerStatus />;
    }

    return (
        <Sidebar
            disabled={disabled}
            links={links}
            version={pkg.version}
            child={ledgerStatus}
        />
    );
}
