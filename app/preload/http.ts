import axios from 'axios';
import { ipcRenderer } from 'electron';
import { walletProxytransactionLimit } from '../constants/externalConstants.json';
import { getTargetNet, Net } from '~/utils/ConfigHelper';
import urls from '../constants/urls.json';
import { intToString, parse } from '~/utils/JSONHelper';
import {
    HttpMethods,
    GetTransactionsResult,
    HttpGetResponse,
} from '~/preload/preloadTypes';
import ipcCommands from '~/constants/ipcCommands.json';

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

async function httpsGet<T>(
    urlString: string,
    params: Record<string, string>
): Promise<HttpGetResponse<T>> {
    const response = await ipcRenderer.invoke(
        ipcCommands.httpsGet,
        urlString,
        params
    );
    return JSON.parse(response);
}

async function getTransactions(
    address: string,
    id: string
): Promise<GetTransactionsResult> {
    const response = await walletProxy.get(
        `/v0/accTransactions/${address}?limit=${walletProxytransactionLimit}&from=${id}&includeRawRejectReason`,
        {
            transformResponse: (res) => parse(intToString(res, 'id')),
        }
    );
    const { transactions, count, limit } = response.data;
    return { transactions, full: count === limit };
}

const exposedMethods: HttpMethods = {
    get: httpsGet,
    getTransactions,
    getIdProviders: async () => {
        const response = await walletProxy.get('/v0/ip_info');
        return response.data;
    },
};

export default exposedMethods;
