import React, { useState } from 'react';
import { Button, Divider, Input, Segment } from 'semantic-ui-react';
import DragAndDropFile from '../../components/DragAndDropFile';
import { createUpdateMultiSignatureTransaction } from '../../utils/MultiSignatureTransactionHelper';
import { ProtocolUpdate, UpdateType } from '../../utils/types';
import { UpdateProps } from '../../utils/UpdateInstructionHelper';

function temp() {
    // TODO Fix openFile interface so that one can also just get the raw Buffer instead of the
    // parsed string value.
}

/**
 * Component for creating an update protocol transaction.
 */
export default function UpdateProtocol({
    blockSummary,
    forwardTransaction,
}: UpdateProps): JSX.Element | null {
    const [protocolUpdate, setProtocolUpdate] = useState<ProtocolUpdate>();

    const { threshold } = blockSummary.updates.authorizations.protocol;
    const sequenceNumber =
        blockSummary.updates.updateQueues.protocol.nextSequenceNumber;

    if (!protocolUpdate) {
        const initialProtocolUpdate: ProtocolUpdate = {
            message: '',
            specificationUrl: '',
            specificationHash: Buffer.alloc(0),
            specificationAuxiliaryData: Buffer.alloc(0),
        };
        setProtocolUpdate(initialProtocolUpdate);
        return null;
    }

    return (
        <Segment basic textAlign="center">
            <Input
                label="Message"
                placeholder="Enter your message here"
                fluid
                value={protocolUpdate.message}
                onChange={(e) => {
                    const updatedProtocolUpdate = {
                        ...protocolUpdate,
                        message: e.target.value,
                    };
                    setProtocolUpdate(updatedProtocolUpdate);
                }}
            />
            <Divider clearing hidden />
            <Input
                label="Specification URL"
                placeholder="Enter specification URL here"
                fluid
                value={protocolUpdate.specificationUrl}
                onChange={(e) => {
                    const updatedProtocolUpdate = {
                        ...protocolUpdate,
                        specificationUrl: e.target.value,
                    };
                    setProtocolUpdate(updatedProtocolUpdate);
                }}
            />
            <Divider clearing hidden />
            <Input
                label="Specification hash"
                placeholder="Enter your specification hash here"
                fluid
                value={protocolUpdate.specificationHash.toString('hex')}
                onChange={(e) => {
                    const updatedProtocolUpdate = {
                        ...protocolUpdate,
                        specificationHash: Buffer.from(e.target.value, 'hex'),
                    };
                    setProtocolUpdate(updatedProtocolUpdate);
                }}
            />
            <Divider clearing hidden />
            <DragAndDropFile
                text="Drag and drop specification auxiliary data"
                fileProcessor={temp}
            />
            <Button
                primary
                onClick={() =>
                    forwardTransaction(
                        createUpdateMultiSignatureTransaction(
                            protocolUpdate,
                            UpdateType.UpdateProtocol,
                            sequenceNumber,
                            threshold
                        )
                    )
                }
            >
                Generate transaction proposal
            </Button>
        </Segment>
    );
}
