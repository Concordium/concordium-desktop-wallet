import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import routes from '../constants/routes.json';
import { Icon, Menu } from 'semantic-ui-react';

export default function Routes() {
    const location = useLocation();
    const sideBarElements = [];
    sideBarElements.push({ route: routes.TEST, title: 'Home', icon: 'home' });
    sideBarElements.push({ route: routes.ACCOUNTS, title: 'Accounts', icon: 'account' });
    sideBarElements.push({ route: routes.IDENTITIES, title: 'Identities', icon: 'phone' });
    sideBarElements.push({ route: routes.ADDRESSBOOK, title: 'Address Book', icon: 'book' });
    sideBarElements.push({
        route: routes.EXPORTIMPORT,
        title: 'Export/Import'
    });
    sideBarElements.push({
        route: routes.MULTISIGTRANSACTIONS,
        title: 'Multi Signature Transactions',
    });
    sideBarElements.push({ route: routes.SETTINGS, title: 'Settings', icon: 'settings' });

    return (
        <Menu icon='labeled' vertical borderless> 
            {sideBarElements.map((member) => (
                <Menu.Item as={Link}
                    name={member.icon}
                    to={member.route}
                    active={member.route === location.pathname}
                >
                    <Icon className={member.icon}/>
                    {member.title}
                </Menu.Item>
            ))}
        </Menu>
    );
}
