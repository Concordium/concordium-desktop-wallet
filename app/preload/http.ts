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
import {
    IncomingTransaction,
    TransactionFilter,
    TransactionOrder,
} from '~/utils/types';
import { secondsSinceUnixEpoch } from '~/utils/timeHelpers';
import { getActiveBooleanFilters } from '~/utils/accountHelpers';
import loggingMethods from './logging';

function getWalletProxy() {
    const targetNet = getTargetNet();
    if (targetNet === Net.Mainnet) {
        return urls.walletProxyMainnet;
    }
    if (targetNet === Net.Testnet) {
        return urls.walletProxyTestnet;
    }
    if (targetNet === Net.Protonet) {
        return urls.walletProxyProtonet;
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
 * Filters transactions on their type. This extra filtering is required
 * as the wallet proxy does not support a fine grained filtering on
 * types at this time.
 * @param transactionFilter the filtering to apply to the transactions
 */
function filterTransactionsOnType(
    transactionFilter: TransactionFilter,
    transactions: IncomingTransaction[]
) {
    const allowedTypes = getActiveBooleanFilters(transactionFilter);
    const filteredTransactions = transactions.filter((t) =>
        allowedTypes.includes(t.details.type)
    );
    return filteredTransactions;
}

/**
 * Loads transactions from the wallet proxy for the account with the provided address. The supplied
 * transaction filter is applied for reward filtering, and filtering based on dates. All other parts
 * of the filter is ignored, as the wallet proxy does not support it!
 * @param address the account address to get transactions for
 * @param transactionFilter is used to filter the result
 * @param limitResults sets the maximum number of results the wallet proxy returns, the maximum is 1000
 * @param order whether to order ascending or descending on the id
 * @param id the id to get transactions from, is used for pagination and should not be used for anything else
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
        transformResponse: (res) => {
            try {
                return parse(intToString(res, 'id'));
            } catch (e) {
                loggingMethods.error(
                    res,
                    'Unable to parse response from wallet proxy'
                );
                throw new Error(
                    `Unable to parse response from wallet proxy: ${res}`
                );
            }
        },
    });

    const {
        transactions,
        count,
        limit,
    }: {
        transactions: IncomingTransaction[];
        count: number;
        limit: number;
    } = response.data;
    const filteredTransactions = filterTransactionsOnType(
        transactionFilter,
        transactions
    );

    let minId;
    let maxId;
    if (transactions.length > 0) {
        if (order === TransactionOrder.Descending) {
            minId = transactions[transactions.length - 1].id;
            maxId = transactions[0].id;
        } else {
            maxId = transactions[transactions.length - 1].id;
            minId = transactions[0].id;
        }
    }

    return {
        transactions: filteredTransactions,
        full: count === limit,
        minId,
        maxId,
    };
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
