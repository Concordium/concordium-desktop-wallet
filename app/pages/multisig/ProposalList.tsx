import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Menu } from 'semantic-ui-react';
import {
    proposalsSelector,
    setCurrentProposal,
} from '../../features/MultiSignatureSlice';
import routes from '../../constants/routes.json';
import ProposalStatus from './ProposalStatus';
import { MultiSignatureTransaction } from '../../utils/types';
import expirationEffect from '../../utils/ProposalHelper';

/**
 * Sorts so that the newest multi signature transaction is first.
 */
function newestFirst(
    o1: MultiSignatureTransaction,
    o2: MultiSignatureTransaction
) {
    return o2.id - o1.id;
}

/**
 * Component that displays a list of multi signature transaction proposals.
 */
export default function ProposalList(): JSX.Element {
    const dispatch = useDispatch();
    const proposals = useSelector(proposalsSelector);

    useEffect(() => {
        proposals.forEach((proposal) => {
            expirationEffect(proposal, dispatch, proposals);
        });
    }, [dispatch, proposals]);

    return (
        <Menu vertical fluid>
            {proposal
                .slice()
                .sort(newestFirst)
                .map((proposal) => {
                    return (
                        <Menu.Item
                            key={proposal.id}
                            as={Link}
                            to={{
                                pathname:
                                    routes.MULTISIGTRANSACTIONS_PROPOSAL_EXISTING,
                            }}
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
