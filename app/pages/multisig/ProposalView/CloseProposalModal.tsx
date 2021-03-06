import React from 'react';
import Columns from '~/components/Columns';
import Button from '~/cross-app-components/Button';
import Modal from '~/cross-app-components/Modal';
import { MultiSignatureTransaction } from '~/utils/types';
import ProposalStatus from '../ProposalStatus';

interface CloseProposalModalProps {
    open: boolean;
    proposal: MultiSignatureTransaction;
    onClose(): void;
    onConfirm(): void;
}

export default function CloseProposalModal({
    open,
    proposal,
    onClose,
    onConfirm,
}: CloseProposalModalProps): JSX.Element {
    return (
        <Modal open={open} onOpen={() => {}} onClose={onClose}>
            <h2>Are you sure that you want to cancel this proposal?</h2>
            <ProposalStatus proposal={proposal} />
            <Columns className="mT20">
                <Columns.Column>
                    <Button onClick={onClose}>No, keep proposal</Button>
                </Columns.Column>
                <Columns.Column>
                    <Button onClick={onConfirm} negative>
                        Yes, cancel
                    </Button>
                </Columns.Column>
            </Columns>
        </Modal>
    );
}
