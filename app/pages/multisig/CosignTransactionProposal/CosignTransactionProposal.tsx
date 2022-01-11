import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import { LocationDescriptorObject } from 'history';
import { Redirect } from 'react-router';
import { parse, stringify } from '~/utils/JSONHelper';

import routes from '~/constants/routes.json';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import findHandler from '~/utils/transactionHandlers/HandlerFinder';
import {
    EqualRecord,
    instanceOfUpdateInstruction,
    UpdateInstructionSignature,
    TransactionAccountSignature,
    MultiSignatureTransactionStatus,
} from '~/utils/types';
import {
    TransactionExportType,
    TransactionInput,
} from '~/utils/transactionTypes';
import SimpleErrorModal, {
    ModalErrorInput,
} from '~/components/SimpleErrorModal';
import { ensureProps } from '~/utils/componentHelpers';
import Columns from '~/components/Columns';
import TransactionDetails from '~/components/TransactionDetails';
import TransactionSignDigestView from '~/components/TransactionSignatureDigestView';
import Form from '~/components/Form';
import Ledger from '~/components/ledger/Ledger';
import { asyncNoOp } from '~/utils/basicHelpers';
import { isExpired } from '~/utils/transactionHelpers';
import TransactionExpirationDetails from '~/components/TransactionExpirationDetails';
import { dateFromTimeStamp } from '~/utils/timeHelpers';
import getTransactionSignDigest from '~/utils/transactionHash';
import ExpiredTransactionView from '../ExpiredTransactionView';
import MultiSignatureLayout from '../MultiSignatureLayout';
import { signUpdateInstruction, signAccountTransaction } from './util';
import saveFile from '~/utils/FileHelper';
import Button from '~/cross-app-components/Button';
import { LedgerCallback } from '~/components/ledger/util';
import findLocalDeployedCredentialWithWallet from '~/utils/credentialHelper';

import styles from './CosignTransactionProposal.module.scss';

interface CosignTransactionProposalForm {
    transactionDetailsMatch: boolean;
    identiconMatch: boolean;
    signDigestMatch: boolean;
}

const fieldNames: EqualRecord<CosignTransactionProposalForm> = {
    transactionDetailsMatch: 'transactionDetailsMatch',
    identiconMatch: 'identiconMatch',
    signDigestMatch: 'signDigestMatch',
};

interface CosignTransactionProposalProps {
    location: LocationDescriptorObject<TransactionInput>;
}

/**
 * Component that displays an overview of an imported multi signature transaction proposal
 * that is to be signed.
 */
function CosignTransactionProposal({
    location,
}: CosignTransactionProposalProps) {
    const [showError, setShowError] = useState<ModalErrorInput>({
        show: false,
    });
    const [signature, setSignature] = useState<
        UpdateInstructionSignature[] | TransactionAccountSignature | undefined
    >();
    const [image, setImage] = useState<string>();

    const dispatch = useDispatch();

    const { transaction } = location.state as TransactionInput;
    const [transactionObject] = useState(parse(transaction));

    const [transactionHandler] = useState(() => findHandler(transactionObject));

    const [
        transactionSignDigest,
        setTransactionSignDigest,
    ] = useState<string>();
    useEffect(() => {
        getTransactionSignDigest(transactionObject)
            .then((digest) => setTransactionSignDigest(digest))
            .catch(() => {});
    }, [transactionObject]);

    const signingFunction: LedgerCallback = async (
        ledger: ConcordiumLedgerClient,
        setStatusText
    ) => {
        let sig;
        if (instanceOfUpdateInstruction(transactionObject)) {
            sig = await signUpdateInstruction(transactionObject, ledger);
        } else {
            const credential = await findLocalDeployedCredentialWithWallet(
                transactionObject.sender,
                ledger
            );
            if (!credential) {
                setShowError({
                    show: true,
                    header: 'Unable to sign transaction',
                    content:
                        'Unable to sign the account transaction, as you do not currently have a matching credential deployed on the given account for the connected wallet.',
                });
                return;
            }
            sig = await signAccountTransaction(
                transactionObject,
                ledger,
                credential
            );
        }
        setSignature(sig);
        setStatusText('Proposal signed successfully');
    };

    async function exportSignedTransaction() {
        const signedTransaction = {
            ...transactionObject,
            signatures: signature,
        };
        const signedTransactionJson = stringify(signedTransaction);

        try {
            await saveFile(signedTransactionJson, {
                title: 'Export signed transaction',
                defaultPath: transactionHandler.getFileNameForExport(
                    transactionObject,
                    TransactionExportType.Signature
                ),
            });
        } catch (err) {
            setShowError({
                show: true,
                header: 'Signature was not saved ',
                content: `An error was encountered while attempting to saving the signature: ${err.message}`,
            });
        }
    }

    if (!transactionSignDigest) {
        return null;
    }

    const isTransactionExpired = isExpired(transactionObject);

    return (
        <>
            <SimpleErrorModal
                show={showError.show}
                header={showError.header}
                content={showError.content}
                onClick={() => dispatch(push(routes.MULTISIGTRANSACTIONS))}
            />
            <MultiSignatureLayout
                pageTitle={transactionHandler.title}
                print={transactionHandler.print(
                    transactionObject,
                    isTransactionExpired
                        ? MultiSignatureTransactionStatus.Expired
                        : MultiSignatureTransactionStatus.Open,
                    image
                )}
                stepTitle="Transaction signing confirmation"
                delegateScroll
            >
                <Ledger ledgerCallback={signingFunction}>
                    {({ isReady, statusView, submitHandler = asyncNoOp }) => (
                        <Form<CosignTransactionProposalForm>
                            className={styles.subtractContainerPadding}
                            onSubmit={submitHandler}
                        >
                            <Columns
                                divider
                                columnClassName={styles.column}
                                columnScroll
                            >
                                <Columns.Column header="Security & submission details">
                                    <div className={styles.columnContent}>
                                        <TransactionSignDigestView
                                            transactionSignDigest={
                                                transactionSignDigest
                                            }
                                            setScreenshot={setImage}
                                        />
                                        {instanceOfUpdateInstruction(
                                            transactionObject
                                        ) && (
                                            <TransactionExpirationDetails
                                                title="Transaction must be submitted to the chain by the  proposer before:"
                                                expirationDate={dateFromTimeStamp(
                                                    transactionObject.header
                                                        .timeout
                                                )}
                                            />
                                        )}
                                    </div>
                                </Columns.Column>
                                <Columns.Column header="Transaction details">
                                    <div className={styles.columnContent}>
                                        <TransactionDetails
                                            transaction={transactionObject}
                                        />
                                        {instanceOfUpdateInstruction(
                                            transactionObject
                                        ) && (
                                            <ExpiredTransactionView
                                                transaction={transactionObject}
                                            />
                                        )}
                                    </div>
                                </Columns.Column>
                                <Columns.Column
                                    header="Signature and hardware wallet"
                                    className={styles.stretchColumn}
                                >
                                    <div className={styles.columnContent}>
                                        <h5>Hardware wallet status</h5>
                                        <div>{statusView}</div>
                                        <div>
                                            <div className={styles.checkboxes}>
                                                <Form.Checkbox
                                                    name={
                                                        fieldNames.transactionDetailsMatch
                                                    }
                                                    rules={{
                                                        required:
                                                            'Please review transaction details',
                                                    }}
                                                    disabled={!!signature}
                                                >
                                                    The transaction details are
                                                    correct
                                                </Form.Checkbox>
                                                <Form.Checkbox
                                                    name={
                                                        fieldNames.identiconMatch
                                                    }
                                                    rules={{
                                                        required:
                                                            'Make sure identicons match.',
                                                    }}
                                                    disabled={!!signature}
                                                >
                                                    The identicon matches the
                                                    one received exactly
                                                </Form.Checkbox>
                                                <Form.Checkbox
                                                    name={
                                                        fieldNames.signDigestMatch
                                                    }
                                                    rules={{
                                                        required:
                                                            'Make sure the digest to sign matches',
                                                    }}
                                                    disabled={!!signature}
                                                >
                                                    The digest to sign matches
                                                    the one received exactly
                                                </Form.Checkbox>
                                            </div>
                                            {signature ? (
                                                <Button
                                                    className={styles.submit}
                                                    onClick={
                                                        exportSignedTransaction
                                                    }
                                                >
                                                    Export signature
                                                </Button>
                                            ) : (
                                                <Form.Submit
                                                    className={styles.submit}
                                                    disabled={
                                                        !isReady ||
                                                        isTransactionExpired
                                                    }
                                                >
                                                    Sign proposal
                                                </Form.Submit>
                                            )}
                                        </div>
                                    </div>
                                </Columns.Column>
                            </Columns>
                        </Form>
                    )}
                </Ledger>
            </MultiSignatureLayout>
        </>
    );
}

export default ensureProps(
    CosignTransactionProposal,
    (p) => !!p.location.state,
    <Redirect to={routes.MULTISIGTRANSACTIONS_SIGN_TRANSACTION} />
);
