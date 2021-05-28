import axios from 'axios';
import * as http from 'http';
import * as https from 'https';
import urls from '../constants/urls.json';
import { walletProxytransactionLimit } from '../constants/externalConstants.json';
import { IncomingTransaction } from './types';
import { getTargetNet, Net } from './ConfigHelper';

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

const defaultTimeout = 60000;

/**
 * This performs a http get Request, returning a Promise on the response.
 * @param {string} urlString: the url at which to perform the getRequest
 * @param params: Additional URL search parameters to add to the request.
 */
export function getPromise(
    urlString: string,
    params: Record<string, string> = {}
): Promise<http.IncomingMessage> {
    const url = new URL(urlString);
    const searchParams = new URLSearchParams(params);
    url.searchParams.forEach((value, name) => searchParams.append(name, value));
    const options = {
        hostname: url.hostname,
        port: url.port,
        path: `${url.pathname}?${searchParams.toString()}`,
        timeout: defaultTimeout,
    };
    return new Promise((resolve) => {
        https.get(options, (res) => resolve(res));
    });
}

/**
 * Given a http response, extract its body.
 */
export function getResponseBody(
    response: http.IncomingMessage
): Promise<string> {
    return new Promise((resolve) => {
        let data = '';
        response.on('data', (chunk) => {
            data += chunk;
        });
        response.on('end', () => resolve(data));
    });
}

interface GetTransactionsOutput {
    transactions: IncomingTransaction[];
    full: boolean;
}

export async function getTransactions(
    address: string,
    id = 0
): Promise<GetTransactionsOutput> {
    const response = await walletProxy.get(
        `/v0/accTransactions/${address}?limit=${walletProxytransactionLimit}&from=${id}&includeRawRejectReason`
    );
    const { transactions, count, limit } = response.data;
    return { transactions, full: count === limit };
}

export async function getIdentityProviders() {
    const response = await walletProxy.get('/v0/ip_info');
    return response.data;
}

/**
 * This function will perform an IdObjectRequest, and Intercept the redirect,
 * returning the location, that the Identity Provider attempted to redirect to.
 */
export async function performIdObjectRequest(
    url: string,
    redirectUri: string,
    idObjectRequest: string
) {
    const parameters = {
        scope: 'identity',
        response_type: 'code',
        redirect_uri: redirectUri,
        state: JSON.stringify({
            idObjectRequest,
        }),
    };
    const response = await getPromise(url, parameters);
    if (response.statusCode === 302) {
        const loc = response.headers.location;
        if (!loc) {
            throw new Error('Unexpected no location in Response');
        }
        if (loc[0] === '/') {
            const urlObject = new URL(url);
            return `https://${urlObject.hostname}${loc}`;
        }
        return loc;
    }
    const message = await getResponseBody(response);
    throw new Error(`Request failed: ${message}`);
}

/**
 * Async timeout
 * time: timeout length, in milliseconds.
 */
export async function sleep(time: number) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

/**
 * This function should poll the given location, until the location returns an IdObject
 * TODO: Handle the service being unavailable
 */
export async function getIdObject(location: string) {
    // eslint-disable-next-line no-constant-condition
    while (true) {
        // eslint-disable-next-line no-await-in-loop
        const response = await getPromise(location);
        // eslint-disable-next-line no-await-in-loop
        const bodyJSON = await getResponseBody(response);
        const data = JSON.parse(bodyJSON);
        switch (data.status) {
            case 'done':
                return data.token;
            case 'error':
                throw new Error(data.detail);
            case 'pending':
                break;
            default:
                throw new Error(`unexpected status: ${data.status}`);
        }
        // eslint-disable-next-line no-await-in-loop
        await sleep(10000);
    }
}
