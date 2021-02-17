import React from 'react';
import { Button, Label } from 'semantic-ui-react';
import { UpdateProps } from '../../utils/UpdateInstructionHelper';

export default function UpdateGasRewards({
    blockSummary,
    forwardTransaction,
}: UpdateProps) {
    const button = <Button onClick={() => forwardTransaction({})} />;

    return (
        <>
            <Label>
                Update gas rewards!{' '}
                {
                    blockSummary.updates.updateQueues.euroPerEnergy
                        .nextSequenceNumber
                }
            </Label>
            {button}
        </>
    );
}
