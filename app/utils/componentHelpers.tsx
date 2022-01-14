import React, { ComponentType } from 'react';
import { DeepPartial, ExtendableProps } from './types';

/**
 * HOC for making a component with some optional props, that if undefined trigger a fallback view to be rendered instead of the component given.
 * Useful for showing a fallback while loading dependencies, while having a type of component props without optional critical properties.
 *
 * @example
 * interface Props {
 *      dep1: string;
 *      dep2: string;
 *      ...
 * }
 *
 * type UnsafeProps = MakeOptional<Props, 'dep1' | 'dep2'>;
 *
 * const Component = (p: Props) => </>;
 * const ComponentWithFallback = ensureProps<Props, UnsafeProps>(
 *      Component,
 *      (p): p is Props => [p.dep1, p.dep2].every(isDefined),
 *      <>Missing information...</>
 * );
 *
 * <ComponentWithFallback dep1={maybeDep1} dep2={maybeDep2} ... />
 */
export function ensureProps<TProps, TUnsafe extends DeepPartial<TProps>>(
    Component: ComponentType<TProps>,
    ensureFun: (props: TUnsafe | TProps) => props is TProps,
    fallback: JSX.Element
): ComponentType<ExtendableProps<TProps, TUnsafe>> {
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
