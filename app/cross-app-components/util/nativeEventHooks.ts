import { useEffect } from 'react';
import { Listen, Listener } from '~/preload/preloadTypes';

// eslint-disable-next-line import/prefer-default-export
export const useIpcRendererEvent: (
    channel: keyof Listen,
    listener: Listener
) => void = (channel: keyof Listen, listener: Listener) => {
    useEffect(() => {
        window.addListener[channel](listener);
        return () => {
            window.removeListener[channel](listener);
        };
    }, [channel, listener]);
};
