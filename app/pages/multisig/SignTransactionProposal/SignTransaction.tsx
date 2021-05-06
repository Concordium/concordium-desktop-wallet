import React, { useState } from 'react';
import clsx from 'clsx';
import Form from '~/components/Form';
import Ledger from '~/components/ledger/Ledger';
import { asyncNoOp } from '~/utils/basicHelpers';
import styles from './SignTransactionProposal.module.scss';
import ConcordiumLedgerClient from '~/features/ledger/ConcordiumLedgerClient';
import { ClassName } from '~/utils/types';

interface Props extends ClassName {
    signingFunction: (
        ledger: ConcordiumLedgerClient,
        setMessage: (message: string) => void
    ) => Promise<void>;
}

export default function SignTransaction({ signingFunction, className }: Props) {
    const [signing, setSigning] = useState(false);
    return (
        <Ledger
            ledgerCallback={signingFunction}
            onSignError={() => setSigning(false)}
        >
            {({ isReady, statusView, submitHandler = asyncNoOp }) => (
                <section className={clsx(styles.signColumnContent, className)}>
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
                            I am sure that the proposed changes are correct
                        </Form.Checkbox>
                        <Form.Submit
                            disabled={signing || !isReady}
                            className="mT10"
                        >
                            Generate Transaction
                        </Form.Submit>
                    </Form>
                </section>
            )}
        </Ledger>
    );
}
