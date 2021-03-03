import React from 'react';
import { Header } from 'semantic-ui-react';
import { getNow, getISOFormat } from '../utils/timeHelpers';
import {
    TimeStampUnit,
    UpdateInstruction,
    UpdateInstructionPayload,
} from '../utils/types';
import findHandler from '../utils/updates/HandlerFinder';

interface Props {
    transaction: UpdateInstruction<UpdateInstructionPayload>;
}

/**
 * Component that displays the details of an UpdateInstruction in a human readable way.
 * @param {UpdateInstruction} transaction: The transaction, which details is displayed.
 */
export default function UpdateInstructionDetails({ transaction }: Props) {
    const handler = findHandler(transaction.type);

    let effectiveTimeComponent;
    if (transaction.header.effectiveTime <= getNow(TimeStampUnit.seconds)) {
        effectiveTimeComponent = (
            <>
                <Header color="red">Effective time</Header>
                {getISOFormat(transaction.header.effectiveTime.toString())}
                <Header color="red" size="small">
                    The effective time has been exceeded
                </Header>
            </>
        );
    } else {
        effectiveTimeComponent = (
            <>
                <Header>Effective time</Header>
                {getISOFormat(transaction.header.effectiveTime.toString())}
            </>
        );
    }

    return (
        <>
            {handler.view(transaction)}
            {effectiveTimeComponent}
        </>
    );
}
