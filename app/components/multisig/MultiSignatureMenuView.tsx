import React from 'react';
import { useSelector } from 'react-redux';
import { chosenMenuSelector } from '../../features/MultiSignatureSlice';
import MultiSignatureCreateProposalList from './MultiSignatureCreateProposalList';
import BrowseTransactionFileView from './BrowseTransactionFileView';
import ProposalList from './ProposalList';
import { MultiSignatureMenuItems } from '../../utils/types';

/**
 * This switches component corresponding to the chosen multi signature menu item.
 */
export default function MultiSignatureMenuView() {
    const chosenMenu: MultiSignatureMenuItems = useSelector(chosenMenuSelector);

    if (chosenMenu === undefined) {
        return null;
    }

    switch (chosenMenu) {
        case MultiSignatureMenuItems.MakeNewProposal:
            return <MultiSignatureCreateProposalList />;
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
