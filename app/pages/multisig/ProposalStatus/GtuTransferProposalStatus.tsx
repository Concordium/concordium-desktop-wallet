import React, { useEffect, useState } from 'react';

import { lookupName } from '~/utils/transactionHelpers';
import {
    AccountTransaction,
    MultiSignatureTransactionStatus,
} from '~/utils/types';
import ProposalStatusView, {
    ProposalStatusViewProps,
} from './ProposalStatusView';

async function getName(sender: string) {
    const name = await lookupName(sender);
    return name || sender;
}

interface GtuTransferProposalStatusProps
    extends Pick<ProposalStatusViewProps, 'className'> {
    transaction: AccountTransaction;
    status: MultiSignatureTransactionStatus;
}

export default function GtuTransferProposalStatus({
    transaction,
    status,
    ...proposalStatusViewProps
}: GtuTransferProposalStatusProps): JSX.Element {
    const [name, setName] = useState<string>('');

    useEffect(() => {
        // eslint-disable-next-line promise/catch-or-return
        getName(transaction.sender).then(setName);
    }, [transaction.sender]);

    return (
        <ProposalStatusView
            {...proposalStatusViewProps}
            headerLeft={name}
            headerRight="GTU Transfer"
            status={status}
            title="GTU Transfer"
        />
    );
}
