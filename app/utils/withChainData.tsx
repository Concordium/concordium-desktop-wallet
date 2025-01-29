/* eslint-disable react/display-name */
import { push } from 'connected-react-router';
import React, { ComponentType, useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { ChainParameters, ConsensusStatus } from '~/node/NodeApiTypes';
import {
    getConsensusStatus,
    getBlockChainParameters,
} from '~/node/nodeRequests';
import routes from '~/constants/routes.json';
import Execute from '~/components/Execute';
import { setConsensusStatus } from '~/features/ChainDataSlice';

export interface ChainData {
    consensusStatus?: ConsensusStatus;
    chainParameters?: ChainParameters;
}

export default function withChainData<TProps extends ChainData>(
    Component: ComponentType<TProps>
): ComponentType<Omit<TProps, keyof ChainData>> {
    return (props) => {
        const [chainData, setChainData] = useState<ChainData | undefined>();
        const dispatch = useDispatch();

        const init = useCallback(async (): Promise<ChainData> => {
            const cs: ConsensusStatus = await getConsensusStatus();
            const chainParameters = await getBlockChainParameters(
                cs.lastFinalizedBlock.toString()
            );

            dispatch(setConsensusStatus(cs));

            return {
                chainParameters,
                consensusStatus: cs,
            };
        }, [dispatch]);

        const enrichedProps: TProps = {
            ...props,
            ...chainData,
        } as TProps;

        return (
            <>
                <Execute
                    execution={init}
                    onError={() =>
                        dispatch(
                            push({ pathname: routes.MULTISIGTRANSACTIONS })
                        )
                    }
                    onSuccess={setChainData}
                    errorTitle="Error communicating with node"
                    errorContent="We were unable to retrieve the block summary from the
            configured node. Verify your node settings, and check that
            the node is running."
                />
                <Component {...enrichedProps} />
            </>
        );
    };
}

export function ensureChainData<TProps extends ChainData>(
    Component: ComponentType<TProps>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    FallBack: ComponentType<any> = () => null
) {
    return withChainData<TProps>((props) => {
        const { chainParameters } = props;

        if (!chainParameters) {
            return <FallBack />;
        }

        return <Component {...props} />;
    });
}
