import axios from 'axios';
import { ipcRenderer } from 'electron';
import { getTargetNet, Net } from '~/utils/ConfigHelper';
import urls from '../constants/urls.json';
import { intToString, parse } from '~/utils/JSONHelper';
import {
    HttpMethods,
    GetTransactionsResult,
    HttpGetResponse,
} from '~/preload/preloadTypes';
import ipcCommands from '~/constants/ipcCommands.json';
import { TransactionFilter, TransactionOrder } from '~/utils/types';
import { secondsSinceUnixEpoch } from '~/utils/timeHelpers';

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

/**
 * Loads the newest transactions on the given address, using the given filters.
 * @param transactionFilter is used to filter the request, however only from/to date, and filters for reward types are currently used.
 */
async function getTransactions(
    address: string,
    transactionFilter: TransactionFilter,
    limitResults: number,
    order: TransactionOrder,
    id?: string
): Promise<GetTransactionsResult> {
    let filters = '';
    if (transactionFilter.bakingReward === false) {
        filters += '&bakingRewards=n';
    }
    if (transactionFilter.blockReward === false) {
        filters += '&blockRewards=n';
    }
    if (transactionFilter.finalizationReward === false) {
        filters += '&finalizationRewards=n';
    }
    if (transactionFilter.fromDate) {
        const timestamp = secondsSinceUnixEpoch(
            new Date(transactionFilter.fromDate)
        );
        filters += `&blockTimeFrom=${timestamp}`;
    }
    if (transactionFilter.toDate) {
        const timestamp = secondsSinceUnixEpoch(
            new Date(transactionFilter.toDate)
        );
        filters += `&blockTimeTo=${timestamp}`;
    }

    let proxyPath = `/v1/accTransactions/${address}?limit=${limitResults}&includeRawRejectReason${filters}&order=${order.toString()}`;
    if (id) {
        proxyPath += `&from=${id}`;
    }

    const response = await walletProxy.get(proxyPath, {
        transformResponse: (res) => parse(intToString(res, 'id')),
    });

    const { transactions, count, limit } = response.data;
    return { transactions, full: count === limit };
}

async function gtuDrop(address: string) {
    const response = await walletProxy.put(`/v0/testnetGTUDrop/${address}`);
    return response.data.submissionId;
}

const exposedMethods: HttpMethods = {
    get: httpsGet,
    getTransactions,
    getIdProviders: async () => {
        const response = await walletProxy.get('/v0/ip_info');
        return response.data;
    },
    gtuDrop,
};

export default exposedMethods;
