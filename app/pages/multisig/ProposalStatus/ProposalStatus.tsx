import React, { PropsWithChildren, useMemo } from 'react';
import Card from '~/cross-app-components/Card';
import { MultiSignatureTransactionStatus } from '~/utils/types';

type ProposalStatusProps = PropsWithChildren<{
    title: string;
    status: MultiSignatureTransactionStatus;
    submittedOn?: Date;
    headerLeft: string;
    headerRight: string;
}>;

export default function ProposalStatus({
    title,
    status,
    submittedOn,
    headerLeft,
    headerRight,
    children,
}: ProposalStatusProps): JSX.Element {
    const submittedOnText = useMemo(
        () => (submittedOn ? submittedOn.toISOString() : 'Unsubmitted'),
        [submittedOn]
    );
    return (
        <Card>
            <div>
                <span>{headerLeft}</span>
                <span>{headerRight}</span>
            </div>
            <div>
                {title}
                {status}
            </div>
            <div>{children}</div>
            <div>
                <span />
                <span>Submitted on: {submittedOnText}</span>
            </div>
        </Card>
    );
}
