import { ipcRenderer } from 'electron';
import { useEffect } from 'react';

// eslint-disable-next-line import/prefer-default-export
export const useIpcRendererEvent: (
    ...args: Parameters<typeof ipcRenderer.on>
) => void = (channel, listener) => {
    useEffect(() => {
        ipcRenderer.on(channel, listener);

        return () => {
            ipcRenderer.off(channel, listener);
        };
    }, [channel, listener]);
};
