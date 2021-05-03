/* eslint-disable react/display-name */
import { push } from 'connected-react-router';
import React, { ComponentType, useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { BlockSummary, ConsensusStatus } from '~/utils/NodeApiTypes';
import { getConsensusStatus, getBlockSummary } from '~/utils/nodeRequests';
import routes from '~/constants/routes.json';
import DynamicModal from '../DynamicModal';

export interface ChainData {
    consensusStatus: ConsensusStatus | undefined;
    blockSummary: BlockSummary | undefined;
}

export default function withChainData<TProps extends ChainData>(
    Component: ComponentType<TProps>
): ComponentType<Omit<TProps, keyof ChainData>> {
    return (props) => {
        const [chainData, setChainData] = useState<ChainData | undefined>();
        const dispatch = useDispatch();

        const init = useCallback(async (): Promise<ChainData> => {
            const cs: ConsensusStatus = await getConsensusStatus();
            const bs = await getBlockSummary(cs.lastFinalizedBlock);

            return {
                blockSummary: bs,
                consensusStatus: cs,
            };
        }, []);

        const enrichedProps: TProps = {
            ...props,
            ...chainData,
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
                    onSuccess={setChainData}
                    title="Error communicating with node"
                    content="We were unable to retrieve the block summary from the
            configured node. Verify your node settings, and check that
            the node is running."
                />
                <Component {...enrichedProps} />
            </>
        );
    };
}
