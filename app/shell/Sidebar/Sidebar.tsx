import React from 'react';
import Sidebar, { SidebarLink } from '../../cross-app-components/Sidebar';
import routes from '../../constants/routes.json';

import styles from './Sidebar.module.scss';

const links: SidebarLink[] = [
    {
        route: routes.TEST,
        title: 'Home',
        icon: <i className={styles.icon} />,
    },
    {
        route: routes.ACCOUNTS,
        title: 'Accounts',
        icon: <i className={styles.icon} />,
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
        icon: <i className={styles.icon} />,
    },
];

export default function ConnectedSidebar() {
    return <Sidebar links={links} />;
}
