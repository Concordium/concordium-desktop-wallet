import React from 'react';
import { NavLink } from 'react-router-dom';
import clsx from 'clsx';

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
    version?: string;
    child?: JSX.Element;
    disabled: boolean;
}

export default function Sidebar({
    links,
    className,
    style,
    disabled = false,
    version,
    child,
}: SidebarProps) {
    const handleClick = (e: React.MouseEvent) => {
        if (disabled) {
            e.preventDefault();
        }
    };

    return (
        <nav className={clsx(styles.root, className)} style={style}>
            <div className={styles.items}>
                <div className={styles.item}>
                    <LogoIcon height="57" />
                </div>
                {links.map((l) => (
                    <NavLink
                        key={l.route}
                        className={clsx(
                            styles.item,
                            disabled && styles.disabled
                        )}
                        to={l.route}
                        onClick={handleClick}
                        activeClassName={styles.itemActive}
                    >
                        {l.icon}
                        <span className={styles.title}>{l.title}</span>
                    </NavLink>
                ))}
            </div>
            {child}
            <section className={styles.bottom}>
                {version && <div>V {version}</div>}
            </section>
        </nav>
    );
}
