import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Menu } from 'semantic-ui-react';
import { parse } from '../../utils/JSONHelper';
import {
    loadProposals,
    proposalsSelector,
    setCurrentProposal,
} from '../../features/MultiSignatureSlice';
import routes from '../../constants/routes.json';
import ProposalStatus from './ProposalStatus';
import {
    MultiSignatureTransaction,
    instanceOfUpdateInstruction,
} from '../../utils/types';

/**
 * Sorts so that the newest multi signature transaction is first.
 */
function newestFirst(
    o1: MultiSignatureTransaction,
    o2: MultiSignatureTransaction
) {
    return o2.id - o1.id;
}

function getProposalPath(proposal: MultiSignatureTransaction) {
    const transaction = parse(proposal.transaction);
    if (instanceOfUpdateInstruction(transaction)) {
        return routes.MULTISIGTRANSACTIONS_PROPOSAL_EXISTING;
    }

    return routes.MULTISIGTRANSACTIONS_PROPOSAL_EXISTING_ACCOUNT_TRANSACTION;
}

/**
 * Component that displays a list of multi signature transaction proposals.
 */
export default function ProposalList(): JSX.Element {
    const dispatch = useDispatch();
    const proposals = useSelector(proposalsSelector);

    useEffect(() => {
        loadProposals(dispatch);
    }, [dispatch]);

    return (
        <Menu vertical fluid>
            {proposals
                .slice()
                .sort(newestFirst)
                .map((proposal) => {
                    return (
                        <Menu.Item
                            key={proposal.id}
                            as={Link}
                            to={getProposalPath(proposal)}
                            onClick={() =>
                                dispatch(setCurrentProposal(proposal))
                            }
                        >
                            <ProposalStatus proposal={proposal} />
                        </Menu.Item>
                    );
                })}
        </Menu>
    );
}
