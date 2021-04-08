import React from 'react';
import { dateFromTimeStamp, getFormattedDateString } from '~/utils/timeHelpers';
import { UpdateInstruction, UpdateInstructionPayload } from '../utils/types';
import { findUpdateInstructionHandler } from '../utils/updates/HandlerFinder';

interface Props {
    transaction: UpdateInstruction<UpdateInstructionPayload>;
}

/**
 * Component that displays the details of an UpdateInstruction in a human readable way.
 * @param {UpdateInstruction} transaction: The transaction, which details is displayed.
 */
export default function UpdateInstructionDetails({
    transaction,
}: Props): JSX.Element {
    const handler = findUpdateInstructionHandler(transaction.type);
    return (
        <>
            {handler.view(transaction)}
            <h5>Effective time</h5>
            <span className="h3">
                {getFormattedDateString(
                    dateFromTimeStamp(transaction.header.effectiveTime)
                )}
            </span>
        </>
    );
}
