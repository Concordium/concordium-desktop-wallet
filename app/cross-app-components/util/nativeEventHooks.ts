import { useEffect } from 'react';
import { ipcRenderer } from '~/global';

// eslint-disable-next-line import/prefer-default-export
export const useIpcRendererEvent: (
    ...args: Parameters<typeof ipcRenderer.on>
) => void = (channel, listener) => {
    useEffect(() => {
        window.ipcRenderer.on(channel, listener);

        return () => {
            window.ipcRenderer.off(channel, listener);
        };
    }, [channel, listener]);
};
