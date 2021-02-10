import React from 'react';
import Sidebar, { SidebarItem } from '../../cross-app-components/Sidebar';
import routes from '../../constants/routes.json';

import styles from './Sidebar.module.scss';

const sideBarItems: SidebarItem[] = [];
sideBarItems.push({
    route: routes.TEST,
    title: 'Home',
    icon: <i className={styles.icon} />,
});
sideBarItems.push({
    route: routes.ACCOUNTS,
    title: 'Accounts',
    icon: <i className={styles.icon} />,
});
sideBarItems.push({
    route: routes.IDENTITIES,
    title: 'Identities',
    icon: <i className={styles.icon} />,
});
sideBarItems.push({
    route: routes.ADDRESSBOOK,
    title: 'Address Book',
    icon: <i className={styles.icon} />,
});
sideBarItems.push({
    route: routes.EXPORTIMPORT,
    title: 'Export/Import',
    icon: <i className={styles.icon} />,
});
sideBarItems.push({
    route: routes.MULTISIGTRANSACTIONS,
    title: 'Multi Signature Transactions',
    icon: <i className={styles.icon} />,
});
sideBarItems.push({
    route: routes.SETTINGS,
    title: 'Settings',
    icon: <i className={styles.icon} />,
});

export default function ConnectedSidebar() {
    return <Sidebar items={sideBarItems} />;
}
