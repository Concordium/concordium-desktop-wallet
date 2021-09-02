import React, { PropsWithChildren } from 'react';

export type TabbedCardTabProps = PropsWithChildren<{
    header: string;
}>;

export default function TabbedCardTab({ children }: TabbedCardTabProps) {
    return <>{children}</>;
}
