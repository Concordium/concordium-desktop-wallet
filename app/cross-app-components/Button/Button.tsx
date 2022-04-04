import clsx from 'clsx';
import React, { ElementType, PropsWithChildren } from 'react';

import { PolymorphicComponentProps } from '~/utils/types';
import Loading from '../Loading';

import styles from './Button.module.scss';

type ButtonSize = 'tiny' | 'small' | 'regular' | 'big' | 'huge';

const sizeStyleMap: Record<ButtonSize, string | undefined> = {
    tiny: styles.rootTiny,
    small: styles.rootSmall,
    regular: undefined,
    big: styles.rootBig,
    huge: styles.rootHuge,
};

interface Props {
    size?: ButtonSize;
    inverted?: boolean;
    clear?: boolean;
    negative?: boolean;
    icon?: JSX.Element;
    disabled?: boolean;
    loading?: boolean;
}

export type ButtonProps<
    TAs extends ElementType = 'button'
> = PolymorphicComponentProps<TAs, Props>;

/**
 * @description
 * Use as a regular \<button /\>.
 * Supports rendering as other component (e.g. NavLink) through 'as' prop
 */
export default function Button<TAs extends ElementType = 'button'>({
    size = 'regular',
    inverted = false,
    clear = false,
    negative = false,
    loading = false,
    icon,
    className,
    as,
    children,
    ...props
}: PropsWithChildren<ButtonProps<TAs>>): JSX.Element {
    const Component = as || 'button';

    const classNames = clear
        ? clsx(styles.clear, className)
        : clsx(
              styles.root,
              size && sizeStyleMap[size],
              inverted && styles.rootInverted,
              negative && styles.rootNegative,
              icon && styles.rootWithIcon,
              className
          );

    return (
        <Component
            type="button"
            disabled={loading}
            className={classNames}
            {...props}
        >
            {loading || (
                <>
                    {icon && <span className={styles.icon}>{icon}</span>}
                    {children}
                </>
            )}
            {loading && <Loading inline className={styles.loading} />}
        </Component>
    );
}
