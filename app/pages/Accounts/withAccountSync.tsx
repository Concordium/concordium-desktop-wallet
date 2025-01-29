import React, { ComponentType, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { chosenAccountSelector } from '~/features/AccountSlice';
import useAccountSync from './useAccountSync';

export interface AccountSyncProps {
    onError(message: string): void;
}

export default function withAccountSync<P>(
    Component: ComponentType<P>
): ComponentType<P & AccountSyncProps> {
    // eslint-disable-next-line react/display-name
    return ({ onError, ...props }) => {
        const account = useSelector(chosenAccountSelector);

        const ReloadWrapper = useCallback(
            () => {
                useAccountSync(onError);
                return <Component {...(props as P & React.Attributes)} />;
            },
            // eslint-disable-next-line react-hooks/exhaustive-deps
            [account?.address]
        );

        return <ReloadWrapper />;
    };
}
