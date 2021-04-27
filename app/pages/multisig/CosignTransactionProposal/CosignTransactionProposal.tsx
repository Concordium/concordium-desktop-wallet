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
} from '~/utils/types';
import { TransactionInput } from '~/utils/transactionTypes';
import SimpleErrorModal, {
    ModalErrorInput,
} from '~/components/SimpleErrorModal';
import { ensureProps } from '~/utils/componentHelpers';
import Columns from '~/components/Columns';
import TransactionDetails from '~/components/TransactionDetails';
import TransactionHashView from '~/components/TransactionHashView';
import Form from '~/components/Form';
import Ledger from '~/components/ledger/Ledger';
import { asyncNoOp } from '~/utils/basicHelpers';
import { isExpired } from '~/utils/transactionHelpers';
import TransactionExpirationDetails from '~/components/TransactionExpirationDetails';
import { dateFromTimeStamp } from '~/utils/timeHelpers';
import getTransactionHash from '~/utils/transactionHash';
import PrintTransaction from '~/components/PrintTransaction';

import ExpiredTransactionView from '../ExpiredTransactionView';
import withBlockSummary, { WithBlockSummary } from '../common/withBlockSummary';
import MultiSignatureLayout from '../MultiSignatureLayout';
import styles from './CosignTransactionProposal.module.scss';
import { signUpdateInstruction, signAccountTransaction } from './util';
import { saveFile } from '~/utils/FileHelper';
import Button from '~/cross-app-components/Button';
import { LedgerCallback } from '~/components/ledger/util';

interface CosignTransactionProposalForm {
    transactionDetailsMatch: boolean;
    identiconMatch: boolean;
    hashMatch: boolean;
}

const fieldNames: EqualRecord<CosignTransactionProposalForm> = {
    transactionDetailsMatch: 'transactionDetailsMatch',
    identiconMatch: 'identiconMatch',
    hashMatch: 'hashMatch',
};

interface CosignTransactionProposalProps extends WithBlockSummary {
    location: LocationDescriptorObject<TransactionInput>;
}

/**
 * Component that displays an overview of an imported multi signature transaction proposal
 * that is to be signed.
 */
const CosignTransactionProposal = withBlockSummary<CosignTransactionProposalProps>(
    ({ location, blockSummary }) => {
        const [showError, setShowError] = useState<ModalErrorInput>({
            show: false,
        });
        const [signature, setSignature] = useState<
            | UpdateInstructionSignature[]
            | TransactionAccountSignature
            | undefined
        >();
        const [transactionHash, setTransactionHash] = useState<string>();

        const dispatch = useDispatch();

        const { transaction } = location.state as TransactionInput;
        const [transactionObject] = useState(parse(transaction));

        const [transactionHandler] = useState(() =>
            findHandler(transactionObject)
        );

        useEffect(() => {
            setTransactionHash(getTransactionHash(transactionObject));
        }, [setTransactionHash, transactionObject]);

        const signingFunction: LedgerCallback = async (
            ledger: ConcordiumLedgerClient,
            setStatusText
        ) => {
            let sig;
            if (instanceOfUpdateInstruction(transactionObject)) {
                if (blockSummary) {
                    try {
                        sig = await signUpdateInstruction(
                            transactionObject,
                            ledger,
                            blockSummary
                        );
                    } catch (e) {
                        setShowError({
                            show: true,
                            header: 'Unauthorized key',
                            content:
                                'Your key is not authorized to sign this update type.',
                        });
                        return;
                    }
                } else {
                    return;
                }
            } else {
                try {
                    sig = await signAccountTransaction(
                        transactionObject,
                        ledger
                    );
                } catch (e) {
                    setShowError({
                        show: true,
                        header: 'Unable to sign transaction',
                        content: e.message,
                    });
                    return;
                }
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
                const fileSaved = await saveFile(
                    signedTransactionJson,
                    'Export signed transaction'
                );

                if (fileSaved) {
                    dispatch(push({ pathname: routes.MULTISIGTRANSACTIONS }));
                }
            } catch (err) {
                // TODO Handle error by showing it to the user.
            }
        }

        if (!transactionHash) {
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
                    print={<PrintTransaction transaction={transactionObject} />}
                    stepTitle={`Transaction signing confirmation - ${transactionHandler.type}`}
                    delegateScroll
                >
                    <Ledger ledgerCallback={signingFunction}>
                        {({
                            isReady,
                            statusView,
                            submitHandler = asyncNoOp,
                        }) => (
                            <Form<CosignTransactionProposalForm>
                                className={styles.subtractContainerPadding}
                                onSubmit={submitHandler}
                            >
                                <Columns
                                    divider
                                    columnClassName={styles.column}
                                    columnScroll
                                >
                                    <Columns.Column header="Security & Submission Details">
                                        <div className={styles.columnContent}>
                                            <TransactionHashView
                                                transactionHash={
                                                    transactionHash
                                                }
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
                                    <Columns.Column header="Transaction Details">
                                        <div className={styles.columnContent}>
                                            <TransactionDetails
                                                transaction={transactionObject}
                                            />
                                            {instanceOfUpdateInstruction(
                                                transactionObject
                                            ) && (
                                                <ExpiredTransactionView
                                                    transaction={
                                                        transactionObject
                                                    }
                                                />
                                            )}
                                        </div>
                                    </Columns.Column>
                                    <Columns.Column
                                        header="Signature and Hardware Wallet"
                                        className={styles.stretchColumn}
                                    >
                                        <div className={styles.columnContent}>
                                            <h5>Hardware wallet status</h5>
                                            <div>{statusView}</div>
                                            <div>
                                                <div
                                                    className={
                                                        styles.checkboxes
                                                    }
                                                >
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
                                                        The transaction details
                                                        are correct
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
                                                        The identicon matches
                                                        the one received exactly
                                                    </Form.Checkbox>
                                                    <Form.Checkbox
                                                        name={
                                                            fieldNames.hashMatch
                                                        }
                                                        rules={{
                                                            required:
                                                                'Make sure hashes match',
                                                        }}
                                                        disabled={!!signature}
                                                    >
                                                        The hash matches the one
                                                        received exactly
                                                    </Form.Checkbox>
                                                </div>
                                                {signature ? (
                                                    <Button
                                                        className={
                                                            styles.submit
                                                        }
                                                        onClick={
                                                            exportSignedTransaction
                                                        }
                                                    >
                                                        Export Signature
                                                    </Button>
                                                ) : (
                                                    <Form.Submit
                                                        className={
                                                            styles.submit
                                                        }
                                                        disabled={
                                                            !isReady ||
                                                            isTransactionExpired
                                                        }
                                                    >
                                                        Sign Proposal
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
);

export default ensureProps(
    CosignTransactionProposal,
    (p) => !!p.location.state,
    <Redirect to={routes.MULTISIGTRANSACTIONS_SIGN_TRANSACTION} />
);
