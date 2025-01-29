import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { max } from '~/utils/basicHelpers';
import { parse } from '~/utils/JSONHelper';
import Loading from '~/cross-app-components/Loading';
import Card from '~/cross-app-components/Card';
import {
    MultiSignatureTransaction,
    instanceOfAccountTransaction,
    instanceOfUpdateInstruction,
    MultiSignatureTransactionStatus,
} from '~/utils/types';
import SimpleErrorModal, {
    ModalErrorInput,
} from '~/components/SimpleErrorModal';
import FileInput from '~/components/Form/FileInput';
import { FileInputValue } from '~/components/Form/FileInput/FileInput';
import { fileListToFileArray } from '~/components/Form/FileInput/util';
import createMultiSignatureTransaction from '~/utils/MultiSignatureTransactionHelper';
import { loadProposals } from '~/features/MultiSignatureSlice';
import {
    insert,
    getMaxOpenNonceOnAccount,
} from '~/database/MultiSignatureProposalDao';
import { getAccount } from '~/database/AccountDao';
import { getNextAccountNonce, getAccountInfo } from '~/node/nodeRequests';
import {
    getlastFinalizedBlockHash,
    getEnergyToMicroGtuRate,
} from '~/node/nodeHelpers';
import { isValidAddress } from '~/utils/accountHelpers';
import { saveMultipleFiles } from '~/utils/FileHelper';
import findHandler from '~/utils/transactionHandlers/HandlerFinder';
import { TransactionExportType } from '~/utils/transactionTypes';
import getTransactionCost, {
    getTransactionEnergyCost,
} from '~/utils/transactionCosts';
import errorMessages from '~/constants/errorMessages.json';

import styles from './BrowseTransactionFile/BrowseTransactionFile.module.scss';

async function loadTransactionFile(
    file: File,
    nonceTracker: Record<string, bigint>,
    fileName: string,
    blockHash: string
): Promise<[string, Partial<MultiSignatureTransaction>] | ModalErrorInput> {
    const ab = await file.arrayBuffer();
    const b = Buffer.from(ab);
    const fileString = b.toString('utf-8');
    let transactionObject;
    try {
        transactionObject = parse(fileString);
    } catch (e) {
        return {
            show: true,
            header: 'Invalid file',
            content: `"${fileName}" is invalid. A file containing a multi signature transaction proposal in JSON format was expected.`,
        };
    }

    if (instanceOfUpdateInstruction(transactionObject)) {
        return {
            show: true,
            header: 'Update instruction not supported',
            content: `The transaction within "${fileName}" is an update instruction, which is not supported for import.`,
        };
    }
    if (!instanceOfAccountTransaction(transactionObject)) {
        return {
            show: true,
            header: 'Invalid file',
            content: `The transaction within "${fileName}" was neither an account transaction nor an update instruction, and is therefore invalid.`,
        };
    }

    const address = transactionObject.sender;
    const account = await getAccount(address);
    if (!account?.signatureThreshold) {
        return {
            show: true,
            header: 'Sender account not known',
            content: `In "${fileName}", the sender of the transaction is not an account in this wallet.`,
        };
    }

    if ('toAddress' in transactionObject.payload) {
        const recipient = transactionObject.payload.toAddress;
        if (!isValidAddress(recipient)) {
            return {
                show: true,
                header: 'Invalid file',
                content: `The transaction within "${fileName}" contains an invalid recipient address.`,
            };
        }
        // Check that the recipient exists.
        const receiverAccountInfo = await getAccountInfo(recipient, blockHash);
        if (!receiverAccountInfo) {
            return {
                show: true,
                header: 'Invalid file',
                content: `The transaction within "${fileName}" contains a recipient address, which does not exist on the blockchain.`,
            };
        }
    }

    if (transactionObject.nonce) {
        return {
            show: true,
            header: 'Unexpected field present',
            content: `In "${fileName}", the nonce was present.`,
        };
    }
    if (transactionObject.energyAmount) {
        return {
            show: true,
            header: 'Unexpected field present',
            content: `In "${fileName}", the energyAmount was present.`,
        };
    }

    if (transactionObject.estimatedFee) {
        return {
            show: true,
            header: 'Unexpected field present',
            content: `In "${fileName}", the estimatedFee was present.`,
        };
    }

    const threshold = account.signatureThreshold;

    // Set the nonce
    if (address in nonceTracker) {
        nonceTracker[address] += 1n;
    } else {
        const accountNonce = await getNextAccountNonce(address);
        const maxOpenNonce = await getMaxOpenNonceOnAccount(address);
        nonceTracker[address] = max(
            BigInt(accountNonce.nonce.value),
            maxOpenNonce + 1n
        );
    }

    transactionObject.nonce = nonceTracker[address].toString();

    // Set the energyAmount
    const energyAmount = getTransactionEnergyCost(transactionObject, threshold);
    transactionObject.energyAmount = energyAmount.toString();

    // Set the estimatedFee
    let exchangeRate;
    try {
        exchangeRate = await getEnergyToMicroGtuRate();
    } catch {
        return {
            show: true,
            header: 'Unable to load exchangeRate',
            content: errorMessages.unableToReachNode,
        };
    }

    const estimatedFee = getTransactionCost(
        transactionObject,
        exchangeRate,
        threshold
    );
    transactionObject.estimatedFee = estimatedFee;

    const proposal = createMultiSignatureTransaction(
        transactionObject,
        threshold,
        MultiSignatureTransactionStatus.Open
    );

    const handler = findHandler(transactionObject);
    const exportName = handler.getFileNameForExport(
        transactionObject,
        TransactionExportType.Proposal
    );

    return [exportName, proposal];
}

/**
 * Component that displays a drag and drop field where proposal files can
 * be dropped to import the proposal. A button can also be used
 * over the drag and drop field.
 */
export default function ImportProposal() {
    const [showError, setShowError] = useState<ModalErrorInput>({
        show: false,
    });
    const [processing, setProcessing] = useState(false);
    const dispatch = useDispatch();

    async function handleFiles(files: File[]) {
        setProcessing(true);
        const proposals: [string, Partial<MultiSignatureTransaction>][] = [];
        const nonceTracker: Record<string, bigint> = {};

        let blockHash;
        try {
            blockHash = await getlastFinalizedBlockHash();
        } catch {
            setProcessing(false);
            setShowError({
                show: true,
                header: 'Unable to load block hash',
                content: errorMessages.unableToReachNode,
            });
            return;
        }

        for (const file of files) {
            const result = await loadTransactionFile(
                file,
                nonceTracker,
                file.name,
                blockHash
            );

            if ('show' in result) {
                setProcessing(false);
                setShowError(result);
                return;
            }
            proposals.push(result);
        }

        for (const [, proposal] of proposals) {
            // Save to database and use the assigned id to update the local object.
            const entryId = (await insert(proposal))[0];
            proposal.id = entryId;
        }

        loadProposals(dispatch);

        await saveMultipleFiles(
            proposals.map(([name, prop]) => [name, prop.transaction || '']),
            'Choose directory to save updated versions of proposals'
        );

        setProcessing(false);
        setShowError({
            show: true,
            header: 'Importing completed',
            content: `All files have been processed and ${files.length} proposals have been added.`,
        });
    }

    const [files, setFiles] = useState<FileInputValue>(null);

    useEffect(() => {
        if (files) {
            const sortedFiles = fileListToFileArray(files).sort((a, b) =>
                a.name.localeCompare(b.name)
            );
            handleFiles(sortedFiles);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [files]);

    return (
        <Card className="pH40 pV30 relative textCenter">
            <SimpleErrorModal
                show={showError.show}
                header={showError.header}
                content={showError.content}
                onClick={() => setShowError({ show: false })}
            />
            <h2 className="textCenter mB40">Import proposals</h2>
            {processing || (
                <FileInput
                    className={styles.input}
                    placeholder="Drag and drop proposal files here"
                    buttonTitle="Or browse to file"
                    multiple
                    value={files}
                    onChange={setFiles}
                    disableFileNames
                />
            )}
            {processing && <Loading inline text="Processing proposals" />}
        </Card>
    );
}
