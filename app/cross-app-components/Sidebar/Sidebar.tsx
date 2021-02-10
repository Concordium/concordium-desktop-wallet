import React from 'react';
import { NavLink } from 'react-router-dom';
import { version } from '../../package.json';

import styles from './Sidebar.module.scss';

export interface SidebarItem {
    route: string;
    icon: JSX.Element;
    title: string;
}

export interface SidebarProps {
    items: SidebarItem[];
}

export default function Sidebar({ items }: SidebarProps) {
    return (
        <nav className={styles.root}>
            <div className={styles.items}>
                {items.map((i) => (
                    <NavLink
                        key={i.route}
                        className={styles.item}
                        to={i.route}
                        activeClassName={styles.itemActive}
                    >
                        {i.icon}
                        {i.title}
                    </NavLink>
                ))}
            </div>
            <div className={styles.bottom}>{version}</div>
        </nav>
    );
}
