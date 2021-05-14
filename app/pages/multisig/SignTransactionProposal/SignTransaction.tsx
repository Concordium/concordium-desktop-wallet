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
    onSkip: () => void;
}

export default function SignTransaction({
    signingFunction,
    onSkip,
    className,
}: Props) {
    const [skipping, setSkipping] = useState(false);
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
                            if (skipping) {
                                onSkip();
                            } else {
                                setSigning(true);
                                submitHandler();
                            }
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
                            onClick={() => setSkipping(false)}
                        >
                            Generate Transaction
                        </Form.Submit>
                        <Form.Submit
                            disabled={signing || !isReady}
                            className="mT10"
                            onClick={() => setSkipping(true)}
                        >
                            Skip Signing
                        </Form.Submit>
                    </Form>
                </section>
            )}
        </Ledger>
    );
}
