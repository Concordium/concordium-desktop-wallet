import React, { useEffect, useState } from 'react';
import { parse } from 'json-bigint';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import { LocationDescriptorObject } from 'history';
import { Redirect } from 'react-router';
import clsx from 'clsx';

import routes from '~/constants/routes.json';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import findHandler from '~/utils/updates/HandlerFinder';
import { EqualRecord, instanceOfUpdateInstruction } from '~/utils/types';
import { TransactionInput } from '~/utils/transactionTypes';
import SimpleErrorModal from '~/components/SimpleErrorModal';
import { ensureProps } from '~/utils/componentHelpers';
import Columns from '~/components/Columns';
import TransactionDetails from '~/components/TransactionDetails';
import TransactionHashView from '~/components/TransactionHashView';
import Form from '~/components/Form';
import Ledger from '~/components/ledger/Ledger';
import { asyncNoOp } from '~/utils/basicHelpers';
import { LedgerStatusType } from '~/components/ledger/util';
import { isExpired } from '~/utils/transactionHelpers';
import TransactionExpirationDetails from '~/components/TransactionExpirationDetails';
import { dateFromTimeStamp } from '~/utils/timeHelpers';
import getTransactionHash from '~/utils/transactionHash';

import ExpiredEffectiveTimeView from '../ExpiredEffectiveTimeView';
import withBlockSummary, { WithBlockSummary } from '../common/withBlockSummary';
import MultiSignatureLayout from '../MultiSignatureLayout';
import styles from './CosignTransactionProposal.module.scss';
import { signUpdateInstruction, signAccountTransaction } from './util';

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
        const [showValidationError, setShowValidationError] = useState(false);
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

        async function signingFunction(
            ledger: ConcordiumLedgerClient,
            setMessage: (message: string) => void
        ) {
            let signature;
            if (instanceOfUpdateInstruction(transactionObject)) {
                if (blockSummary) {
                    try {
                        signature = await signUpdateInstruction(
                            transactionObject,
                            ledger,
                            blockSummary
                        );
                    } catch (e) {
                        setShowValidationError(true);
                        return;
                    }
                } else {
                    return;
                }
            } else {
                try {
                    signature = await signAccountTransaction(
                        transactionObject,
                        ledger
                    );
                } catch (e) {
                    setMessage(e);
                    return;
                }
            }
            // Load the page for exporting the signed transaction.
            dispatch(
                push({
                    pathname: routes.MULTISIGTRANSACTIONS_EXPORT_TRANSACTION,
                    state: {
                        transaction,
                        transactionHash,
                        signature,
                    },
                })
            );
        }

        if (!transactionHash) {
            return null;
        }

        const isTransactionExpired = isExpired(transactionObject);

        return (
            <>
                <SimpleErrorModal
                    show={showValidationError}
                    header="Unauthorized key"
                    content="Your key is not authorized to sign this update type."
                    onClick={() => dispatch(push(routes.MULTISIGTRANSACTIONS))}
                />
                <MultiSignatureLayout
                    pageTitle={transactionHandler.title}
                    stepTitle={`Transaction signing confirmation - ${transactionHandler.type}`}
                >
                    <Ledger ledgerCallback={signingFunction}>
                        {(status, statusView, submitHandler = asyncNoOp) => (
                            <Form<CosignTransactionProposalForm>
                                className={clsx(
                                    styles.body,
                                    styles.bodySubtractPadding
                                )}
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
                                                <ExpiredEffectiveTimeView
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
                                                    >
                                                        The hash matches the one
                                                        received exactly
                                                    </Form.Checkbox>
                                                </div>
                                                <Form.Submit
                                                    className={styles.submit}
                                                    disabled={
                                                        status !==
                                                            LedgerStatusType.CONNECTED ||
                                                        isTransactionExpired
                                                    }
                                                >
                                                    Sign Proposal
                                                </Form.Submit>
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
