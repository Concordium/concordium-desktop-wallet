import { parse } from 'json-bigint';
import React, { useMemo } from 'react';
// import { lookupName } from '~/utils/transactionHelpers';
import {
    instanceOfUpdateInstruction,
    MultiSignatureTransaction,
    // Transaction,
    // UpdateType,
} from '~/utils/types';
import ChainUpdateProposalStatus from './ChainUpdateProposalStatus';
import { ProposalStatusViewProps } from './ProposalStatusView';

// async function getHeader(transaction: Transaction) {
//     if (instanceOfUpdateInstruction(transaction)) {
//         return UpdateType[transaction.type];
//     }
//     const name = await lookupName(transaction.sender);
//     return name || transaction.sender;
// }

// function getType(transaction: Transaction) {
//     if (instanceOfUpdateInstruction(transaction)) {
//         return 'Foundation transaction';
//     }
//     return 'Account transaction';
// }

interface ProposalStatusProps
    extends Pick<ProposalStatusViewProps, 'className'> {
    proposal: MultiSignatureTransaction;
}

export default function ProposalStatus({
    proposal,
    ...proposalStatusProps
}: ProposalStatusProps): JSX.Element | null {
    const { status, transaction } = proposal;
    const parsed = useMemo(() => parse(transaction), [transaction]);

    // TODO handle other transaction types...
    if (instanceOfUpdateInstruction(parsed)) {
        return (
            <ChainUpdateProposalStatus
                {...proposalStatusProps}
                status={status}
                transaction={parsed}
            />
        );
    }

    return <div />;
}
