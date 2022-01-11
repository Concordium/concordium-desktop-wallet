import { push } from 'connected-react-router';
import React from 'react';
import { useDispatch } from 'react-redux';
import Label from '~/components/Label';
import Button from '~/cross-app-components/Button';
import { createProposalRoute } from '~/utils/routerHelper';
import { UpdateType, TransactionTypes } from '~/utils/types';
import { typeToDisplay } from '~/utils/updates/HigherLevelKeysHelpers';

interface Props {
    type: UpdateType;
    currentKeySetSize: number;
    newKeySetSize: number;
}

/**
 * Component for displaying a status of the current key set size, and what the
 * key set size will become if the update goes through.
 */
export default function KeySetSize({
    type,
    currentKeySetSize,
    newKeySetSize,
}: Props) {
    const dispatch = useDispatch();

    return (
        <>
            <div>
                <p>
                    Please confirm that the changes to the total amount of{' '}
                    {typeToDisplay(type)} keys is as expected.
                </p>
                <Label className="mB5">
                    Current size of {typeToDisplay(type)} key set
                </Label>
                <div className="body2">{currentKeySetSize}</div>
                <Label className="mB5 mT40">
                    New size of {typeToDisplay(type)} key set
                </Label>
                <div className="body2">{newKeySetSize}</div>
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
