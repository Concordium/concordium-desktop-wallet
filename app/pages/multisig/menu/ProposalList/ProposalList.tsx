import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { proposalsSelector } from '~/features/MultiSignatureSlice';
import { MultiSignatureTransaction } from '~/utils/types';
import { expireProposals } from '~/utils/ProposalHelper';
import { selectedProposalRoute } from '~/utils/routerHelper';
import ProposalStatus from '../../ProposalStatus';

import styles from './ProposalList.module.scss';
import Button from '~/cross-app-components/Button';

const PAGE_SIZE = 50;

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
    const [listSize, setListSize] = useState(PAGE_SIZE);
    const hasMore = listSize < proposals.length;

    useEffect(() => {
        return expireProposals(proposals, dispatch);
    }, [dispatch, proposals]);

    return (
        <>
            {proposals
                .slice()
                .sort(newestFirst)
                .slice(0, hasMore ? listSize : undefined)
                .map((p) => (
                    <Link
                        className={styles.link}
                        key={p.id}
                        to={selectedProposalRoute(p.id)}
                    >
                        <ProposalStatus className={styles.item} proposal={p} />
                    </Link>
                ))}
            {hasMore && (
                <Button
                    className={styles.button}
                    onClick={() => setListSize((v) => v + PAGE_SIZE)}
                >
                    Show {PAGE_SIZE} more
                </Button>
            )}
        </>
    );
}
