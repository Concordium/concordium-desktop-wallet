import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import { useDispatch } from 'react-redux';
import { max } from '~/utils/basicHelpers';
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
import {
    insert,
    getMaxOpenNonceOnAccount,
} from '~/database/MultiSignatureProposalDao';
import { getAccount } from '~/database/AccountDao';
import { getNextAccountNonce, getAccountInfo } from '~/node/nodeRequests';
import { getlastFinalizedBlockHash } from '~/node/nodeHelpers';
import { saveMultipleFiles } from '~/utils/FileHelper';
import findHandler from '~/utils/transactionHandlers/HandlerFinder';
import { TransactionExportType } from '~/utils/transactionTypes';
import getTransactionCost, {
    getTransactionEnergyCost,
} from '~/utils/transactionCosts';
import Loading from '~/cross-app-components/Loading';
import Card from '~/cross-app-components/Card';
import { ensureExchangeRate } from '~/components/Transfers/withExchangeRate';

async function loadTransactionFile(
    file: File,
    indexRecord: Record<string, bigint>,
    fileName: string,
    exchangeRate: Fraction,
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

    let threshold;
    if (instanceOfUpdateInstruction(transactionObject)) {
        return {
            show: true,
            header: 'Update Instruction not supported',
            content: `The transaction within "${fileName}" is an update instruction, which is not supported for import.`,
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
            if (address in indexRecord) {
                indexRecord[address] += 1n;
            } else {
                const accountNonce = await getNextAccountNonce(address);
                const maxOpenNonce = await getMaxOpenNonceOnAccount(address);
                indexRecord[address] = max(
                    BigInt(accountNonce.nonce),
                    maxOpenNonce + 1n
                );
            }

            transactionObject.nonce = indexRecord[address].toString();
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
        if ('toAddress' in transactionObject.payload) {
            // Check that the recipient exists.
            const receiverAccountInfo = await getAccountInfo(
                transactionObject.payload.toAddress,
                blockHash
            );
            if (!receiverAccountInfo) {
                return {
                    show: true,
                    header: 'Invalid file',
                    content: `The transaction within "${fileName}" contains a recipient address, which does not exist on the blockchain.`,
                };
            }
        }
    } else {
        return {
            show: true,
            header: 'Invalid file',
            content: `The transaction within "${fileName}" was neither an account transaction nor an update instruction, and is therefore invalid.`,
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
        const index: Record<string, bigint> = {};
        let result;
        const blockHash = await getlastFinalizedBlockHash();
        for (const file of files) {
            result = await loadTransactionFile(
                file,
                index,
                file.name,
                exchangeRate,
                blockHash
            );

            if ('show' in result) {
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
            'Choose Directory to save updated versions of proposals'
        );

        setShowError({
            show: true,
            header: 'Importing Completed',
            content: `All files have been processed and ${files.length} proposals have been added.`,
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
            <h1 className="textCenter">Import Proposals</h1>
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
    <>
        <h1 className="textCenter">Import Proposals</h1>
        <Card className={clsx(styles.input, 'relative')}>
            <Loading text="Fetching information from the node" />
        </Card>
    </>
);

export default ensureExchangeRate(ImportProposal, loadingComponent);
