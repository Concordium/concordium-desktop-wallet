import React from 'react';
import { dateFromTimeStamp, getFormattedDateString } from '~/utils/timeHelpers';
import { UpdateInstruction, UpdateInstructionPayload } from '~/utils/types';
import findHandler from '~/utils/updates/HandlerFinder';

import styles from './UpdateInstructionDetails.module.scss';

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
    const handler = findHandler(transaction.type);
    const date = dateFromTimeStamp(transaction.header.effectiveTime);

    return (
        <div className={styles.root}>
            {handler.view(transaction)}
            {date && (
                <div>
                    <h5>Effective time:</h5>
                    <span className={styles.timestamp}>
                        {getFormattedDateString(date)}
                    </span>
                </div>
            )}
        </div>
    );
}
