import React from 'react';
import { NavLink } from 'react-router-dom';
import { version } from '../../package.json';

import styles from './Sidebar.module.scss';

export interface SidebarItem {
    route: string;
    icon: string;
    title: string;
}

export interface SidebarProps {
    items: SidebarItem[];
}

export default function Sidebar({ items }: SidebarProps) {
    return (
        <nav className={styles.root}>
            {items.map((i) => (
                <NavLink
                    key={i.route}
                    className={styles.item}
                    to={i.route}
                    activeClassName={styles.itemActive}
                >
                    {i.title}
                </NavLink>
                // <Menu.Item
                //     key={i.route}
                //     as={Link}
                //     name={i.icon}
                //     to={i.route}
                //     active={i.route === location.pathname}
                // >
                //     <Icon className={i.icon} />
                //     {i.title}
                // </Menu.Item>
            ))}
            <div>{version}</div>
        </nav>
        // <Menu icon="labeled" vertical borderless fixed="left">
        //     <div style={{ position: 'absolute', bottom: '0', width: '100%' }}>
        //         <Menu.Item key="version">V{version}</Menu.Item>
        //     </div>
        // </Menu>
    );
}
