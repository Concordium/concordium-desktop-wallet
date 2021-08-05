import axios from 'axios';
import { walletProxytransactionLimit } from '../constants/externalConstants.json';
import { getTargetNet, Net } from '~/utils/ConfigHelper';
import urls from '../constants/urls.json';
import { intToString, parse } from '~/utils/JSONHelper';
import {
    HttpMethods,
    GetTransactionsResult,
    HttpGetResponse,
} from '~/preloadTypes';

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

// TODO do we need to handle the errors internally in the function?
async function httpsGet<T>(
    urlString: string,
    params: Record<string, string>
): Promise<HttpGetResponse<T>> {
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
        // We also want to accept a 302 redirect, as that is used by the
        // identity provider flow
        validateStatus: (status: number) => status >= 200 && status <= 302,
    });
    clearTimeout(timeout);

    return {
        data: response.data,
        headers: response.headers,
        status: response.status,
    };
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

const initializeIpcHandlers: HttpMethods = {
    get: httpsGet,
    getTransactions,
    getIdProviders: async () => {
        const response = await walletProxy.get('/v0/ip_info');
        return response.data;
    },
};

export default initializeIpcHandlers;
