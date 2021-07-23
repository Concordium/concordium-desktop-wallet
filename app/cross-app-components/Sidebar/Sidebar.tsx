import React, { ChangeEventHandler, useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import clsx from 'clsx';

import { ClassNameAndStyle } from '../../utils/types';
import LogoIcon from '../../../resources/svg/logo.svg';

import styles from './Sidebar.module.scss';
import Switch from '../Switch';
import routes from '../../constants/routes.json';

export interface SidebarLink {
    route: string;
    icon: JSX.Element;
    title: string;
}

export interface SidebarProps<THasSwitch extends boolean>
    extends ClassNameAndStyle {
    links: SidebarLink[];
    version?: string;
    child?: JSX.Element;
    disabled: boolean;
    hasThemeSwitch?: THasSwitch;
    isDark?: THasSwitch extends true ? boolean : undefined;
    onThemeChange?: THasSwitch extends true
        ? (isDark: boolean) => void
        : undefined;
}

export default function Sidebar<THasSwitch extends boolean = false>({
    links,
    className,
    style,
    disabled = false,
    version,
    hasThemeSwitch,
    isDark = false,
    child,
    onThemeChange,
}: SidebarProps<THasSwitch>) {
    const handleSwitchToggle: ChangeEventHandler<HTMLInputElement> = useCallback(
        (e) => {
            if (onThemeChange) {
                onThemeChange(e.target.checked);
            }
        },

        [onThemeChange]
    );

    const handleClick = (e: React.MouseEvent) => {
        if (disabled) {
            e.preventDefault();
        }
    };

    return (
        <nav className={clsx(styles.root, className)} style={style}>
            <div className={styles.items}>
                <NavLink
                    className={styles.item}
                    to={routes.HOME}
                    activeClassName={styles.itemActive}
                >
                    <span className={styles.itemContent}>
                        <LogoIcon height="57" />
                    </span>
                </NavLink>
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
                        <span className={styles.itemContent}>
                            {l.icon}
                            <span className={styles.title}>{l.title}</span>
                        </span>
                    </NavLink>
                ))}
            </div>
            {child}
            <section className={styles.bottom}>
                {hasThemeSwitch && (
                    <Switch checked={isDark} onChange={handleSwitchToggle} />
                )}
                {version && <div>V {version}</div>}
            </section>
        </nav>
    );
}
