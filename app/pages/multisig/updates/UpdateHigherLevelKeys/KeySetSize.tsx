import { push } from 'connected-react-router';
import React from 'react';
import { useDispatch } from 'react-redux';
import Button from '~/cross-app-components/Button';
import { createProposalRoute } from '~/utils/routerHelper';
import { UpdateType } from '~/utils/types';
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
                <h2>Size of the {typeToDisplay(type)} key set</h2>
                <p>
                    Please confirm that the changes to the total amount of{' '}
                    {typeToDisplay(type)} keys is as expected.
                </p>
                <h2>Current size of {typeToDisplay(type)} key set</h2>
                <h1>{currentKeySetSize}</h1>
                <h2>New size of {typeToDisplay(type)} key set</h2>
                <h1>{newKeySetSize}</h1>
            </div>
            <Button
                onClick={() =>
                    dispatch(push(`${createProposalRoute(type)}/threshold`))
                }
            >
                Continue
            </Button>
        </>
    );
}
