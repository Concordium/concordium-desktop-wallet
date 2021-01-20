import React from 'react';
import { useSelector } from 'react-redux';
import { chosenMenuSelector } from '../../features/MultiSignatureSlice';
import { MultiSignatureMenuItems } from './MultiSignatureList';
import MultiSignatureProposalView from './MultiSignatureCreateProposalView';
import BrowseTransactionFileView from './BrowseTransactionFileView';
import ProposalList from './ProposalList';

export default function MultisignatureView() {
    const chosenMenu: MultiSignatureMenuItems = useSelector(chosenMenuSelector);

    if (chosenMenu === undefined) {
        return null;
    }

    switch (chosenMenu) {
        case MultiSignatureMenuItems.MakeNewProposal:
            return <MultiSignatureProposalView />;
        case MultiSignatureMenuItems.ProposedTransactions:
            return <ProposalList />;
        case MultiSignatureMenuItems.SignTransaction:
            return <BrowseTransactionFileView />;
        default:
            throw new Error(
                `An unexpected menu item was selected: ${chosenMenu}`
            );
    }
}
