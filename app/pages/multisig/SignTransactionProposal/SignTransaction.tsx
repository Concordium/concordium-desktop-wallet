import React, { useState } from 'react';
import Form from '~/components/Form';
import Ledger from '~/components/ledger/Ledger';
import { asyncNoOp } from '~/utils/basicHelpers';
import styles from './SignTransactionProposal.module.scss';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';

interface Props {
    signingFunction: (
        ledger: ConcordiumLedgerClient,
        setMessage: (message: string) => void
    ) => Promise<void>;
}

export default function SignTransaction({ signingFunction }: Props) {
    const [signing, setSigning] = useState(false);
    return (
        <Ledger
            ledgerCallback={signingFunction}
            onSignError={() => setSigning(false)}
        >
            {({ isReady, statusView, submitHandler = asyncNoOp }) => (
                <section className={styles.signColumnContent}>
                    <h5>Hardware wallet status</h5>
                    {statusView}
                    <Form
                        onSubmit={() => {
                            setSigning(true);
                            submitHandler();
                        }}
                    >
                        <Form.Checkbox
                            name="check"
                            rules={{
                                required:
                                    'Make sure the proposed changes are correct',
                            }}
                            disabled={signing}
                        >
                            I am sure that the propsed changes are correct
                        </Form.Checkbox>
                        <Form.Submit
                            disabled={signing || !isReady}
                            className={styles.submit}
                        >
                            Generate Transaction
                        </Form.Submit>
                    </Form>
                </section>
            )}
        </Ledger>
    );
}
