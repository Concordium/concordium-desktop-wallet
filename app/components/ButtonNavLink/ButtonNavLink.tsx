import clsx from 'clsx';
import React from 'react';
import { NavLink, NavLinkProps } from 'react-router-dom';
import Button, { ButtonProps } from '../../cross-app-components/Button';

import styles from './ButtonNavLink.module.scss';

type ButtonNavLinkProps = Omit<ButtonProps<NavLink>, 'as'> &
    NavLinkProps & { disabled?: boolean };

/**
 * @description
 * Render \<NavLink /\> as button with active state.
 */
export default function ButtonNavLink({
    className,
    inverted = true,
    disabled = false,
    size = 'huge',
    ...props
}: ButtonNavLinkProps): JSX.Element {
    if (!disabled) {
        props.activeClassName = 'active';
    }
    return (
        <Button
            as={disabled ? undefined : NavLink}
            className={clsx(styles.root, className)}
            disabled={disabled}
            inverted={inverted}
            size={size}
            {...props}
        />
    );
}
