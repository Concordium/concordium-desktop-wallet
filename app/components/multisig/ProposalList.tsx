import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Grid, Header, Menu } from 'semantic-ui-react';
import {
    loadProposals,
    proposalsSelector,
    setCurrentProposal,
} from '../../features/MultiSignatureSlice';
import routes from '../../constants/routes.json';
import { UpdateInstruction, UpdateType } from '../../utils/types';
import TransactionDetails from '../TransactionDetails';

// TODO The menu item description should be something other than the JSON of the transaction. Currently it is not
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
                // TODO This has to be dynamically parsed depending on the actual type (account transaction vs. update instruction).
                const updateInstruction: UpdateInstruction = JSON.parse(
                    proposal.transaction
                );
                return (
                    <Menu.Item
                        key={proposal.transaction}
                        as={Link}
                        to={{
                            pathname:
                                routes.MULTISIGTRANSACTIONS_PROPOSAL_EXISTING,
                        }}
                        onClick={() => dispatch(setCurrentProposal(proposal))}
                    >
                        <Grid padded>
                            <Grid.Row columns="equal">
                                <Grid.Column>
                                    <Header>
                                        {UpdateType[updateInstruction.type]}
                                    </Header>
                                </Grid.Column>
                                <Grid.Column textAlign="right">
                                    <Header>Foundation transaction</Header>
                                </Grid.Column>
                            </Grid.Row>
                            <Grid.Row centered>
                                <TransactionDetails
                                    updateInstruction={updateInstruction}
                                />
                            </Grid.Row>
                            <Grid.Row>
                                <Grid.Column>
                                    <Header>Status</Header>
                                    {proposal.status.charAt(0).toUpperCase() +
                                        proposal.status.slice(1)}
                                </Grid.Column>
                            </Grid.Row>
                        </Grid>
                    </Menu.Item>
                );
            })}
        </Menu>
    );
}
