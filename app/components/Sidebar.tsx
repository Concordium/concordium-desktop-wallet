import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Icon, Menu } from 'semantic-ui-react';
import routes from '../constants/routes.json';

export default function Routes() {
    const location = useLocation();
    const sideBarElements = [];
    sideBarElements.push({ route: routes.TEST, title: 'Home', icon: 'home' });
    sideBarElements.push({
        route: routes.ACCOUNTS,
        title: 'Accounts',
        icon: 'user',
    });
    sideBarElements.push({
        route: routes.IDENTITIES,
        title: 'Identities',
        icon: 'id badge',
    });
    sideBarElements.push({
        route: routes.ADDRESSBOOK,
        title: 'Address Book',
        icon: 'book',
    });
    sideBarElements.push({
        route: routes.EXPORTIMPORT,
        title: 'Export/Import',
        icon: 'share',
    });
    sideBarElements.push({
        route: routes.MULTISIGTRANSACTIONS,
        title: 'Multi Signature Transactions',
        icon: 'gavel',
    });
    sideBarElements.push({
        route: routes.SETTINGS,
        title: 'Settings',
        icon: 'settings',
    });

    return (
        <Menu icon="labeled" vertical borderless fixed="left">
            {sideBarElements.map((member) => (
                <Menu.Item
                    key={member.route}
                    as={Link}
                    name={member.icon}
                    to={member.route}
                    active={member.route === location.pathname}
                >
                    <Icon className={member.icon} />
                    {member.title}
                </Menu.Item>
            ))}
        </Menu>
    );
}
