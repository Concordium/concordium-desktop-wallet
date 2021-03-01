import React, { useEffect, useState } from 'react';
import { Divider, Input, Segment } from 'semantic-ui-react';
import DragAndDropFile from '../../components/DragAndDropFile';
import { createUpdateMultiSignatureTransaction } from '../../utils/MultiSignatureTransactionHelper';
import { ProtocolUpdate, UpdateType } from '../../utils/types';
import { UpdateProps } from '../../utils/transactionTypes';

const auxiliaryDataMaxSizeKb = 2048;

/**
 * Component for creating an update protocol transaction.
 */
export default function UpdateProtocol({
    blockSummary,
    effectiveTime,
    setProposal,
}: UpdateProps): JSX.Element | null {
    const [protocolUpdate, setProtocolUpdate] = useState<ProtocolUpdate>();
    const [loadedFileName, setLoadedFileName] = useState<string | undefined>();

    const { threshold } = blockSummary.updates.authorizations.protocol;
    const sequenceNumber =
        blockSummary.updates.updateQueues.protocol.nextSequenceNumber;

    useEffect(() => {
        if (protocolUpdate) {
            setProposal(
                createUpdateMultiSignatureTransaction(
                    protocolUpdate,
                    UpdateType.UpdateProtocol,
                    sequenceNumber,
                    threshold,
                    effectiveTime
                )
            );
        }
    }, [protocolUpdate, sequenceNumber, threshold, setProposal, effectiveTime]);

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

    function loadAuxiliaryData(auxiliaryData: Buffer, fileName: string) {
        if (protocolUpdate) {
            const updatedProtocolUpdate: ProtocolUpdate = {
                ...protocolUpdate,
                specificationAuxiliaryData: auxiliaryData.toString('base64'),
            };
            setProtocolUpdate(updatedProtocolUpdate);
            setLoadedFileName(fileName);
        }
    }

    // TODO Disable continue button if:
    //                 disabled={
    //     protocolUpdate.specificationHash.length !== 64 ||
    //     !isHex(protocolUpdate.specificationHash) ||
    //     !protocolUpdate.message ||
    //     !protocolUpdate.specificationUrl
    // }

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
                maxSizeKb={auxiliaryDataMaxSizeKb}
                loadedFileName={loadedFileName}
            />
        </Segment>
    );
}
