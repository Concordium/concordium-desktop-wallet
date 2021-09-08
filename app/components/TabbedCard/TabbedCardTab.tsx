import React, { forwardRef, PropsWithChildren } from 'react';

export interface TabbedCardTabRef {
    focus(): void;
}

export type TabbedCardTabProps = PropsWithChildren<{
    header: string;
    initActive?: boolean;
    onClick?(): void;
}>;

// eslint-disable-next-line react/display-name
const TabbedCardTab = forwardRef<TabbedCardTabRef, TabbedCardTabProps>(
    ({ children }) => {
        return <>{children}</>;
    }
);

export default TabbedCardTab;
