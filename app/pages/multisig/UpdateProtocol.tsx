import React, { useState } from 'react';
import { Button, Divider, Input, Segment } from 'semantic-ui-react';
import DragAndDropFile from '../../components/DragAndDropFile';
import { isHex } from '../../utils/basicHelpers';
import { createUpdateMultiSignatureTransaction } from '../../utils/MultiSignatureTransactionHelper';
import { ProtocolUpdate, UpdateType } from '../../utils/types';
import { UpdateProps } from '../../utils/UpdateInstructionHelper';

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
            specificationHash: '',
            specificationAuxiliaryData: '',
        };
        setProtocolUpdate(initialProtocolUpdate);
        return null;
    }

    function loadAuxiliaryData(auxiliaryData: Buffer) {
        if (protocolUpdate) {
            const updatedProtocolUpdate: ProtocolUpdate = {
                ...protocolUpdate,
                specificationAuxiliaryData: auxiliaryData.toString('base64'),
            };
            setProtocolUpdate(updatedProtocolUpdate);
        }
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
                value={protocolUpdate.specificationHash}
                onChange={(e) => {
                    const updatedProtocolUpdate = {
                        ...protocolUpdate,
                        specificationHash: e.target.value,
                    };
                    setProtocolUpdate(updatedProtocolUpdate);
                }}
            />
            <Divider clearing hidden />
            <DragAndDropFile
                text="Drag and drop specification auxiliary data"
                fileProcessor={loadAuxiliaryData}
                maxSizeKb={2048}
            />
            <Button
                primary
                disabled={
                    protocolUpdate.specificationHash.length !== 64 ||
                    !isHex(protocolUpdate.specificationHash) ||
                    !protocolUpdate.message ||
                    !protocolUpdate.specificationUrl
                }
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
