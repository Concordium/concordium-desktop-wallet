import React from 'react';
import { Header } from 'semantic-ui-react';
import { getNow, getISOFormat } from '../../utils/timeHelpers';
import {
    MultiSignatureTransaction,
    UpdateInstruction,
    UpdateInstructionPayload,
    MultiSignatureTransactionStatus,
    TimeStampUnit,
} from '../../utils/types';

interface Props {
    proposal: MultiSignatureTransaction;
    transaction: UpdateInstruction<UpdateInstructionPayload>;
}

export default function EffectiveTimeView({ transaction, proposal }: Props) {
    let effectiveTimeComponent;
    // TODO Note that it is the timeoute/expiration that we react on as that is always prior to the
    // effective time. This makes sense currently as the expiration is always 1 second earlier than the
    // effective time, but that might not be the case we end up with. If we change that, then this
    // should be reconsidered.
    if (
        proposal.status === MultiSignatureTransactionStatus.Failed &&
        transaction.header.timeout <= getNow(TimeStampUnit.seconds)
    ) {
        effectiveTimeComponent = (
            <>
                <Header color="red">Effective time</Header>
                {getISOFormat(transaction.header.effectiveTime.toString())}
                <Header color="red" size="small">
                    The transaction has expired
                </Header>
            </>
        );
    } else {
        effectiveTimeComponent = (
            <>
                <Header>Effective time</Header>
                {getISOFormat(transaction.header.effectiveTime.toString())}wtf
            </>
        );
    }

    return effectiveTimeComponent;
}
