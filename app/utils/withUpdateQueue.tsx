/* eslint-disable react/display-name */
import { push } from 'connected-react-router';
import React, { ComponentType, useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { NextUpdateSequenceNumbers } from '@concordium/web-sdk';

import { getNextUpdateSequenceNumbers } from '~/node/nodeRequests';
import routes from '~/constants/routes.json';
import Execute from '~/components/Execute';

export interface WithUpdateQueues {
    nextUpdateSequenceNumbers: NextUpdateSequenceNumbers;
    // TODO: Add the queues if needed
}

export default function withUpdateQueue<TProps extends WithUpdateQueues>(
    Component: ComponentType<TProps>
): ComponentType<Omit<TProps, keyof WithUpdateQueues>> {
    return (props) => {
        const [chainData, setChainData] = useState<
            WithUpdateQueues | undefined
        >();
        const dispatch = useDispatch();

        const init = useCallback(async (): Promise<WithUpdateQueues> => {
            const nextUpdateSequenceNumbers = await getNextUpdateSequenceNumbers();
            return {
                nextUpdateSequenceNumbers,
            };
        }, []);

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
                    errorContent="We were unable to retrieve the update queues from the
            configured node. Verify your node settings, and check that
            the node is running."
                />
                <Component {...enrichedProps} />
            </>
        );
    };
}

export function ensureUpdateQueue<TProps extends WithUpdateQueues>(
    Component: ComponentType<TProps>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    FallBack: ComponentType<any> = () => null
) {
    return withUpdateQueue<TProps>((props) => {
        const { nextUpdateSequenceNumbers } = props;

        if (!nextUpdateSequenceNumbers) {
            return <FallBack />;
        }

        return <Component {...props} />;
    });
}
