import React from 'react';
import Sidebar, { SidebarItem } from '../cross-app-components/Sidebar';
import routes from '../constants/routes.json';

const sideBarItems: SidebarItem[] = [];
sideBarItems.push({ route: routes.TEST, title: 'Home', icon: 'home' });
sideBarItems.push({
    route: routes.ACCOUNTS,
    title: 'Accounts',
    icon: 'user',
});
sideBarItems.push({
    route: routes.IDENTITIES,
    title: 'Identities',
    icon: 'id badge',
});
sideBarItems.push({
    route: routes.ADDRESSBOOK,
    title: 'Address Book',
    icon: 'book',
});
sideBarItems.push({
    route: routes.EXPORTIMPORT,
    title: 'Export/Import',
    icon: 'share',
});
sideBarItems.push({
    route: routes.MULTISIGTRANSACTIONS,
    title: 'Multi Signature Transactions',
    icon: 'gavel',
});
sideBarItems.push({
    route: routes.SETTINGS,
    title: 'Settings',
    icon: 'settings',
});

export default function ConnectedSidebar() {
    return <Sidebar items={sideBarItems} />;
}
