import axios from 'axios';
import { IncomingMessage } from 'http';
import { IpcMain } from 'electron';
import https from 'https';
import ipcCommands from '../constants/ipcCommands.json';
import { walletProxytransactionLimit } from '../constants/externalConstants.json';
import { getTargetNet, Net } from '~/utils/ConfigHelper';
import urls from '../constants/urls.json';
import { intToString, parse } from '~/utils/JSONHelper';

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

async function httpsGet(
    urlString: string,
    params: Record<string, string>
): Promise<IncomingMessage> {
    const url = new URL(urlString);
    const searchParams = new URLSearchParams(params);
    url.searchParams.forEach((value, name) => searchParams.append(name, value));
    const options = {
        hostname: url.hostname,
        port: url.port,
        path: `${url.pathname}?${searchParams.toString()}`,
        timeout: 60000,
    };

    return new Promise((resolve) => {
        https.get(options, (res) => resolve(res));
    });
}

function getResponseBody(response: IncomingMessage): Promise<string> {
    return new Promise((resolve) => {
        let data = '';
        response.on('data', (chunk) => {
            data += chunk;
        });
        response.on('end', () => resolve(data));
    });
}

export default function initializeIpcHandlers(ipcMain: IpcMain) {
    ipcMain.handle(
        ipcCommands.httpGet,
        async (_event, urlString: string, params: Record<string, string>) => {
            const response = await httpsGet(urlString, params);
            const body = await getResponseBody(response);
            return {
                body,
                statusCode: response.statusCode,
                location: response.headers.location,
            };
        }
    );

    ipcMain.handle(
        ipcCommands.getTransactions,
        async (_event, address: string, id: number) => {
            const response = await walletProxy.get(
                `/v0/accTransactions/${address}?limit=${walletProxytransactionLimit}&from=${id}&includeRawRejectReason`,
                {
                    transformResponse: (res) => parse(intToString(res, 'id')),
                }
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

    ipcMain.handle(ipcCommands.createAxios, (_event, baseUrl) => {
        return axios.create({
            baseURL: baseUrl,
        });
    });
}
