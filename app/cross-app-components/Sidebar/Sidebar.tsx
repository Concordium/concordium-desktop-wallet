import React from 'react';
import { NavLink } from 'react-router-dom';
import { version } from '../../package.json';

import styles from './Sidebar.module.scss';

export interface SidebarLink {
    route: string;
    icon: JSX.Element;
    title: string;
}

export interface SidebarProps {
    links: SidebarLink[];
}

export default function Sidebar({ links }: SidebarProps) {
    return (
        <nav className={styles.root}>
            <div className={styles.items}>
                {links.map((l) => (
                    <NavLink
                        key={l.route}
                        className={styles.item}
                        to={l.route}
                        activeClassName={styles.itemActive}
                    >
                        {l.icon}
                        <span className={styles.title}>{l.title}</span>
                    </NavLink>
                ))}
            </div>
            <div className={styles.bottom}>{version}</div>
        </nav>
    );
}
