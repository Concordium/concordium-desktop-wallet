import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { parse } from '~/utils/JSONHelper';
import {
    Fraction,
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
import styles from './BrowseTransactionFile/BrowseTransactionFile.module.scss';
import { fileListToFileArray } from '~/components/Form/FileInput/util';
import createMultiSignatureTransaction from '~/utils/MultiSignatureTransactionHelper';
import { loadProposals } from '~/features/MultiSignatureSlice';
import { insert } from '~/database/MultiSignatureProposalDao';
import { getAccount } from '~/database/AccountDao';
import { getNextAccountNonce } from '~/node/nodeRequests';
import { saveMultipleFiles } from '~/utils/FileHelper';
import findHandler from '~/utils/transactionHandlers/HandlerFinder';
import { TransactionExportType } from '~/utils/transactionTypes';
import getTransactionCost, {
    getTransactionEnergyCost,
} from '~/utils/transactionCosts';
import Loading from '~/cross-app-components/Loading';
import { ensureExchangeRate } from '~/components/Transfers/withExchangeRate';

async function loadTransactionFile(
    file: File,
    index: number,
    fileName: string,
    exchangeRate: Fraction
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

    let threshold;
    if (instanceOfUpdateInstruction(transactionObject)) {
        // TODO get the treshold on the updateType, instead of giving an error.
        return {
            show: true,
            header: 'Update Instruction not supported',
            content: `The transaction within "${fileName}" is an update instruction, which is not supported yet.`,
        };
    }
    if (instanceOfAccountTransaction(transactionObject)) {
        const address = transactionObject.sender;
        const account = await getAccount(address);
        if (!account?.signatureThreshold) {
            return {
                show: true,
                header: 'Sender Account not known',
                content: `In "${fileName}", the sender of the transaction is not an your account.`,
            };
        }
        threshold = account.signatureThreshold;

        if (!transactionObject.nonce) {
            const accountNonce = await getNextAccountNonce(address);
            transactionObject.nonce = (
                BigInt(accountNonce.nonce) + BigInt(index)
            ).toString();
        }
        if (!transactionObject.energyAmount) {
            const energyAmount = getTransactionEnergyCost(
                transactionObject,
                threshold
            );
            transactionObject.energyAmount = energyAmount.toString();
        }
        if (!transactionObject.estimatedFee) {
            const estimatedFee = getTransactionCost(
                transactionObject,
                exchangeRate,
                threshold
            );
            transactionObject.estimatedFee = estimatedFee;
        }
    } else {
        return {
            show: true,
            header: 'Invalid file',
            content: `The transaction within "${fileName}" was neither an account transaction nor an update instruction, and it is therefore invalid.`,
        };
    }

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

interface Props {
    exchangeRate: Fraction;
}

/**
 * Component that displays a drag and drop field where proposal files can
 * be dropped to import the proposal. A button can also be used
 * over the drag and drop field.
 */
function ImportProposal({ exchangeRate }: Props) {
    const [showError, setShowError] = useState<ModalErrorInput>({
        show: false,
    });
    const dispatch = useDispatch();

    async function handleFiles(files: File[]) {
        const proposals: [string, Partial<MultiSignatureTransaction>][] = [];
        let index = 0;
        let result;
        for (const file of files) {
            result = await loadTransactionFile(
                file,
                index,
                file.name,
                exchangeRate
            );

            if ('show' in result) {
                result.content += ` (${index} files were succesfully processed and their proposals were added)`;
                setShowError(result);
                break;
            } else {
                index += 1;
                proposals.push(result);
            }
        }

        for (const [, proposal] of proposals) {
            // Save to database and use the assigned id to update the local object.
            const entryId = (await insert(proposal))[0];
            proposal.id = entryId;
        }

        loadProposals(dispatch);

        await saveMultipleFiles(
            proposals.map(([name, prop]) => [name, prop.transaction || ''])
        );

        setShowError({
            show: true,
            header: 'Importing Completed',
            content: `All files have been processed and ${index} proposals have been added.`,
        });
    }

    const [files, setFiles] = useState<FileInputValue>(null);

    useEffect(() => {
        if (!files) return;
        const sortedFiles = fileListToFileArray(files).sort((a, b) =>
            a.name.localeCompare(b.name)
        );
        handleFiles(sortedFiles);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [files]);

    return (
        <>
            <SimpleErrorModal
                show={showError.show}
                header={showError.header}
                content={showError.content}
                onClick={() => setShowError({ show: false })}
            />
            <FileInput
                className={styles.input}
                placeholder="Drag and drop file here"
                buttonTitle="Or browse to file"
                multiple
                value={files}
                onChange={setFiles}
                disableFileNames
            />
        </>
    );
}

const loadingComponent = () => (
    <Loading text="Fetching information from the node" />
);

export default ensureExchangeRate(ImportProposal, loadingComponent);
