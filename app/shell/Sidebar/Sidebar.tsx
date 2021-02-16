import React from 'react';
import Sidebar, { SidebarLink } from '../../cross-app-components/Sidebar';
import routes from '../../constants/routes.json';

import GtuIcon from '../../../resources/svg/gtu.svg';
import CogIcon from '../../../resources/svg/cog.svg';

import styles from './Sidebar.module.scss';

const links: SidebarLink[] = [
    {
        route: routes.ACCOUNTS,
        title: 'Accounts',
        icon: <GtuIcon />,
    },
    {
        route: routes.IDENTITIES,
        title: 'Identities',
        icon: <i className={styles.icon} />,
    },
    {
        route: routes.ADDRESSBOOK,
        title: 'Address Book',
        icon: <i className={styles.icon} />,
    },
    {
        route: routes.EXPORTIMPORT,
        title: 'Export/Import',
        icon: <i className={styles.icon} />,
    },
    {
        route: routes.MULTISIGTRANSACTIONS,
        title: 'Multi Signature Transactions',
        icon: <i className={styles.icon} />,
    },
    {
        route: routes.SETTINGS,
        title: 'Settings',
        icon: <CogIcon />,
    },
];

export default function ConnectedSidebar() {
    return <Sidebar links={links} />;
}
