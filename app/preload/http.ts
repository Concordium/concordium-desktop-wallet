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
import { IncomingTransaction, TransactionFilter } from '~/utils/types';
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
 * N.B. does not load reward transactions.
 */
async function getNewestTransactions(
    address: string,
    transactionFilter: TransactionFilter
): Promise<IncomingTransaction[]> {
    let filters = '';
    console.log(transactionFilter);
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
    console.log(filters);
    const response = await walletProxy.get(
        `/v1/accTransactions/${address}?limit=${walletProxytransactionLimit}&order=descending&includeRawRejectReason${filters}`,
        {
            transformResponse: (res) => parse(intToString(res, 'id')),
        }
    );
    const { transactions } = response.data;
    return transactions;
}

async function getTransactions(
    address: string,
    id: string
): Promise<GetTransactionsResult> {
    const response = await walletProxy.get(
        `/v1/accTransactions/${address}?limit=${walletProxytransactionLimit}&from=${id}&includeRawRejectReason`,
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
    getNewestTransactions,
    getIdProviders: async () => {
        const response = await walletProxy.get('/v0/ip_info');
        return response.data;
    },
};

export default exposedMethods;
