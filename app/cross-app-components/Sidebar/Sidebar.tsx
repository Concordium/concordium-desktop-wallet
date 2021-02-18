import React from 'react';
import { NavLink } from 'react-router-dom';
import clsx from 'clsx';

import { version } from '../../package.json';
import { ClassNameAndStyle } from '../../utils/types';
import LogoIcon from '../../../resources/svg/logo.svg';

import styles from './Sidebar.module.scss';

export interface SidebarLink {
    route: string;
    icon: JSX.Element;
    title: string;
}

export interface SidebarProps extends ClassNameAndStyle {
    links: SidebarLink[];
}

export default function Sidebar({ links, className, style }: SidebarProps) {
    return (
        <nav className={clsx(styles.root, className)} style={style}>
            <div className={styles.items}>
                <NavLink
                    className={styles.item}
                    to="/"
                    activeClassName={styles.itemActive}
                    exact
                >
                    <LogoIcon height="57" />
                </NavLink>
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
            <div className={styles.bottom}>V {version}</div>
        </nav>
    );
}
