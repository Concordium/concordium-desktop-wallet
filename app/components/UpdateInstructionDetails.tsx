import React from 'react';
import { Header } from 'semantic-ui-react';
import { getISOFormat } from '../utils/timeHelpers';
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
            <Header>Effective time</Header>
            {getISOFormat(transaction.header.effectiveTime.toString())}
        </>
    );
}
