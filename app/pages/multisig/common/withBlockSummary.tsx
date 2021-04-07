/* eslint-disable react/display-name */
import { push } from 'connected-react-router';
import React, { ComponentType, useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { BlockSummary, ConsensusStatus } from '~/utils/NodeApiTypes';
import { getConsensusStatus, getBlockSummary } from '~/utils/nodeRequests';
import routes from '~/constants/routes.json';
import DynamicModal from '../DynamicModal';

export interface WithBlockSummary {
    blockSummary: BlockSummary | undefined;
}

export default function withBlockSummary<TProps extends WithBlockSummary>(
    Component: ComponentType<TProps>
): ComponentType<Omit<TProps, keyof WithBlockSummary>> {
    return (props) => {
        const [blockSummary, setBlockSummary] = useState<
            BlockSummary | undefined
        >();
        const dispatch = useDispatch();

        const init = useCallback(async () => {
            const consensusStatus: ConsensusStatus = await getConsensusStatus();
            return getBlockSummary(consensusStatus.lastFinalizedBlock);
        }, []);

        const propsWithBlockSummary: TProps = {
            ...props,
            blockSummary,
        } as TProps;

        return (
            <>
                <DynamicModal
                    execution={init}
                    onError={() =>
                        dispatch(
                            push({ pathname: routes.MULTISIGTRANSACTIONS })
                        )
                    }
                    onSuccess={setBlockSummary}
                    title="Error communicating with node"
                    content="We were unable to retrieve the block summary from the
            configured node. Verify your node settings, and check that
            the node is running."
                />
                <Component {...propsWithBlockSummary} />
            </>
        );
    };
}
