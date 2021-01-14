import React from 'react';
import { useSelector } from 'react-redux';
import { chosenMenuSelector } from '../../features/MultiSignatureSlice';
import { MultiSignatureMenuItems } from './MultiSignatureList';
import MultiSignatureProposalView from './MultiSignatureCreateProposalView';

export default function MultisignatureView() {
    const chosenMenu: MultiSignatureMenuItems = useSelector(chosenMenuSelector)

    if (chosenMenu === undefined) {
        return null;
    }

    switch (chosenMenu) {
        case MultiSignatureMenuItems.MakeNewProposal:
            return <MultiSignatureProposalView />;
        case MultiSignatureMenuItems.ProposedTransactions:
            return <div>Proposed transactions view</div>;
        case MultiSignatureMenuItems.SignTransaction:
            return <div>Sign transaction view</div>;
        default:
            throw new Error(`An unexpected menu item was selected: ${chosenMenu}`);
    }
}
