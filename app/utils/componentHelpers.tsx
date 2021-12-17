import React, { ComponentType } from 'react';

/* eslint-disable import/prefer-default-export */
export function ensureProps<TProps>(
    Component: ComponentType<TProps>,
    ensureFun: (props: TProps) => boolean,
    fallback: JSX.Element
): ComponentType<TProps> {
    // eslint-disable-next-line react/display-name
    return (props) => {
        if (!ensureFun(props)) {
            return fallback;
        }

        return <Component {...props} />;
    };
}

/**
 * Partially apply component, creating a new component more tailored to a specific purpose
 *
 * @example
 *  Props {
 *      name: string;
 *      gender: 'male' | 'female';
 *  }
 *
 *  function Person(p: Props) {...}
 *
 *  const Man = partialApply(Person, {gender: 'male'}); // <Man name="John" />
 */
export function partialApply<P, A extends Partial<P>>(
    Component: ComponentType<P>,
    apply: A
): ComponentType<Omit<P, keyof A>> {
    // eslint-disable-next-line react/display-name
    return (props) => <Component {...(apply as A)} {...(props as P)} />;
}
