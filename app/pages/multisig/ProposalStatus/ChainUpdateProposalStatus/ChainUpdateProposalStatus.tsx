import clsx from 'clsx';
import React from 'react';
import { ensureNumberLength } from '~/utils/basicHelpers';
import { dateFromTimeStamp, datePartsFromDate } from '~/utils/timeHelpers';
import {
    MultiSignatureTransactionStatus,
    TimeStampUnit,
    UpdateInstruction,
    UpdateInstructionPayload,
} from '~/utils/types';
import findHandler from '~/utils/transactionHandlers/HandlerFinder';
import ProposalStatusView, {
    ProposalStatusViewProps,
} from '../ProposalStatusView';
import styles from './ChainUpdateProposalStatus.module.scss';

interface ChainUpdateProposalStatusProps<
    TUpdate extends UpdateInstructionPayload
> extends Pick<ProposalStatusViewProps, 'className'> {
    status: MultiSignatureTransactionStatus;
    transaction: UpdateInstruction<TUpdate>;
}

export default function ChainUpdateProposalStatus<
    TUpdate extends UpdateInstructionPayload
>({
    status,
    transaction,
    ...proposalStatusProps
}: ChainUpdateProposalStatusProps<TUpdate>): JSX.Element {
    const handler = findHandler(transaction);
    const expired = status === MultiSignatureTransactionStatus.Expired;
    const { year, month, date } =
        datePartsFromDate(
            dateFromTimeStamp(
                transaction.header.effectiveTime,
                TimeStampUnit.seconds
            )
        ) ?? {};

    return (
        <ProposalStatusView
            {...proposalStatusProps}
            headerLeft="Foundation"
            headerRight="Chain Update"
            title={handler.type}
            status={status}
        >
            <span className={clsx(expired && styles.expired)}>
                Effective time: {ensureNumberLength(2)(date)} -{' '}
                {ensureNumberLength(2)(month)} - {ensureNumberLength(4)(year)}
            </span>
        </ProposalStatusView>
    );
}
