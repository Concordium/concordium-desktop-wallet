import { push } from 'connected-react-router';
import React from 'react';
import { useDispatch } from 'react-redux';
import Button from '~/cross-app-components/Button';
import { createProposalRoute } from '~/utils/routerHelper';
import { UpdateType, TransactionTypes } from '~/utils/types';

interface Props {
    type: UpdateType;
}

/**
 * Component for displaying a status of the current access structure key set size, and what the
 * key set size will become if the update goes through.
 */
export default function AccessStructureKeySetSize({ type }: Props) {
    const dispatch = useDispatch();

    return (
        <>
            <div>
                <p>
                    Please confirm that the changes to the total amount of level
                    2 keys is as expected.
                </p>
            </div>
            <Button
                onClick={() =>
                    dispatch(
                        push(
                            `${createProposalRoute(
                                TransactionTypes.UpdateInstruction,
                                type
                            )}/threshold`
                        )
                    )
                }
            >
                Continue
            </Button>
        </>
    );
}
