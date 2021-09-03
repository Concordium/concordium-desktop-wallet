import React, { PropsWithChildren } from 'react';

export type TabbedCardTabProps = PropsWithChildren<{
    header: string;
    initActive?: boolean;
    onClick?(): void;
}>;

export default function TabbedCardTab({ children }: TabbedCardTabProps) {
    return <>{children}</>;
}
