import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import routes from '../constants/routes.json';
import styles from '../Main.css';

export default function Routes() {
    const location = useLocation();
    const sideBarElements = [];
    sideBarElements.push({ route: routes.TEST, title: 'Home' });
    sideBarElements.push({ route: routes.ACCOUNTS, title: 'Accounts' });
    sideBarElements.push({ route: routes.IDENTITIES, title: 'Identities' });
    sideBarElements.push({ route: routes.ADDRESSBOOK, title: 'Address Book' });
    sideBarElements.push({
        route: routes.EXPORTIMPORT,
        title: 'Export/Import',
    });
    sideBarElements.push({
        route: routes.MULTISIGTRANSACTIONS,
        title: 'Multi Signature Transactions',
    });
    sideBarElements.push({ route: routes.SETTINGS, title: 'Settings' });

    return (
        <div className={styles.sidebar}>
            {sideBarElements.map((member) => (
                <Link
                    to={member.route}
                    key={member.route}
                    className={`${styles.sidebarListElement} ${
                        member.route === location.pathname
                            ? styles.sidebarSelectedListElement
                            : null
                    }`}
                >
                    {member.title}{' '}
                </Link>
            ))}
        </div>
    );
}
