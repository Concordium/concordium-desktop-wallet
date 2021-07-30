import axios from 'axios';
import { IpcMain } from 'electron';
import ipcCommands from '../constants/ipcCommands.json';
import { walletProxytransactionLimit } from '../constants/externalConstants.json';
import { getTargetNet, Net } from '~/utils/ConfigHelper';
import urls from '../constants/urls.json';

function getWalletProxy() {
    const targetNet = getTargetNet();
    if (targetNet === Net.Mainnet) {
        return urls.walletProxyMainnet;
    }
    if (targetNet === Net.Testnet) {
        return urls.walletProxyTestnet;
    }
    if (targetNet === Net.Stagenet) {
        return urls.walletProxyStagenet;
    }
    throw new Error('Unknown target network');
}

const walletProxy = axios.create({
    baseURL: getWalletProxy(),
});

async function httpsGet(urlString: string, params: Record<string, string>) {
    // Setup timeout for axios (it's a little weird, as default timeout
    // settings in axios only concern themselves with response timeout,
    // not a connect timeout).
    const source = axios.CancelToken.source();
    const timeout = setTimeout(() => {
        source.cancel();
    }, 60000);

    const searchParams = new URLSearchParams(params);
    let urlGet: string;
    if (Object.entries(params).length === 0) {
        urlGet = urlString;
    } else {
        urlGet = `${urlString}?${searchParams.toString()}`;
    }

    const response = await axios.get(urlGet, {
        cancelToken: source.token,
        maxRedirects: 0,
        validateStatus(status: number) {
            // We also want to accept a 302 redirect, as that is used by the
            // identity provider flow
            return status >= 200 && status <= 302;
        },
    });
    clearTimeout(timeout);

    return JSON.stringify({
        data: response.data,
        headers: response.headers,
        status: response.status,
    });
}

export default function initializeIpcHandlers(ipcMain: IpcMain) {
    ipcMain.handle(
        ipcCommands.httpGet,
        async (_event, urlString: string, params: Record<string, string>) => {
            try {
                return await httpsGet(urlString, params);
            } catch (error) {
                return {
                    error: JSON.stringify(error),
                };
            }
        }
    );

    ipcMain.handle(
        ipcCommands.getTransactions,
        async (_event, address: string, id: number) => {
            const response = await walletProxy.get(
                `/v0/accTransactions/${address}?limit=${walletProxytransactionLimit}&from=${id}&includeRawRejectReason`
            );
            const { transactions, count, limit } = response.data;
            return { transactions, full: count === limit };
        }
    );

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ipcMain.handle(ipcCommands.getIdProviders, async (_event) => {
        const response = await walletProxy.get('/v0/ip_info');
        return response.data;
    });
}
