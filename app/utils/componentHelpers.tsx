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
