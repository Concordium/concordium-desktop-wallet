import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { proposalsSelector } from '../../../features/MultiSignatureSlice';
import { MultiSignatureTransaction } from '../../../utils/types';
import { expireProposals } from '../../../utils/ProposalHelper';
import { selectedProposalRoute } from '../../../utils/routerHelper';
import ProposalStatus from '../ProposalStatus';

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
        return expireProposals(proposals, dispatch);
    }, [dispatch, proposals]);

    return (
        <>
            {proposals
                .slice()
                .sort(newestFirst)
                .map((p) => (
                    <Link key={p.id} to={selectedProposalRoute(p.id)}>
                        <ProposalStatus {...p} />
                    </Link>
                ))}
        </>
    );
}
