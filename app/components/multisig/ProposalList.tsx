import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Menu } from 'semantic-ui-react';
import {
    loadProposals,
    proposalsSelector,
    updateCurrentProposal,
} from '../../features/MultiSignatureSlice';
import routes from '../../constants/routes.json';

// TODO The menu item description should be something other than the status. Currently it is not
// clear to me what it should be from our UI sketches, as they only represent simple transfers.
// Perhaps it should contain the status, and perhaps how many signatures are missing? Type of transaction?
// Account that created it if not a governance transaction.

/**
 * Component that displays a list of multi signature transaction proposals.
 */
export default function ProposalList() {
    const dispatch = useDispatch();
    const proposals = useSelector(proposalsSelector);

    useEffect(() => {
        loadProposals(dispatch);
    }, [dispatch]);

    return (
        <Menu vertical fluid>
            {proposals.map((proposal) => {
                updateCurrentProposal(dispatch, proposal);
                return (
                    <Menu.Item
                        key={proposal.transaction}
                        as={Link}
                        to={{
                            pathname:
                                routes.MULTISIGTRANSACTIONS_PROPOSAL_EXISTING,
                        }}
                    >
                        {proposal.status}
                    </Menu.Item>
                );
            })}
        </Menu>
    );
}
