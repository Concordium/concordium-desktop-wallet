import { useEffect } from 'react';
import { Listen, Listener } from '~/preloadTypes';

// eslint-disable-next-line import/prefer-default-export
export const useIpcRendererEvent: (
    channel: keyof Listen,
    listener: Listener
) => void = (channel: keyof Listen, listener: Listener) => {
    useEffect(() => {
        window.listen[channel](listener);
        // return () => {
        //   window.ipcRenderer.off(channel, listener);
        // };
    }, [channel, listener]);
};
