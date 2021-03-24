import React, { ComponentType } from 'react';

/* eslint-disable import/prefer-default-export */
export function ensureProps<TProps>(
    ensureFun: (props: TProps) => boolean,
    fallback: JSX.Element,
    Component: ComponentType<TProps>
): ComponentType<TProps> {
    // eslint-disable-next-line react/display-name
    return (props) => {
        if (!ensureFun(props)) {
            return fallback;
        }

        return <Component {...props} />;
    };
}
