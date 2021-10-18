import React, { forwardRef, PropsWithChildren } from 'react';

export interface TabbedCardTabRef {
    focus(): void;
}

export type TabbedCardTabProps = PropsWithChildren<{
    header: string | JSX.Element;
    initActive?: boolean;
    onClick?(): void;
}>;

// eslint-disable-next-line react/display-name
const TabbedCardTab = forwardRef<TabbedCardTabRef, TabbedCardTabProps>(
    // Following disable is needed to remove console warning about wrong use of forwardRef function.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ({ children }, _ref) => {
        return <>{children}</>;
    }
);

export default TabbedCardTab;
