import React, { PropsWithChildren } from 'react';

export type TabbedCardTabProps = PropsWithChildren<{
    header: string;
    onClick?(): void;
    /**
     * Control active state from outside
     */
    isActive?: boolean;
}>;

export default function TabbedCardTab({ children }: TabbedCardTabProps) {
    return <>{children}</>;
}
