import React from 'react';
import { BlockSummary } from '~/node/NodeApiTypes';
import { UpdateType } from '~/utils/types';

interface Props {
    blockSummary: BlockSummary;
    type: UpdateType;
}

export default function UpdateAuthorizationKeys({ blockSummary, type }: Props) {
    return (
        <div>
            Testing
            {blockSummary}
            {type}
        </div>
    );
}
