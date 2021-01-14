import * as axios from 'axios';
import * as http from 'http';
import { getHighestId } from './transactionHelpers';
import urls from '../constants/urls.json';

const walletProxy = axios.create({
    baseURL: urls.walletProxy,
});

/**
 * This performs a http get Request, returning a Promise on the response.
 * @param {string} urlString: the url at which to perform the getRequest
 * @param params: Additional URL search parameters to add to the request.
 */
function getPromise(urlString: string, params) {
    const url = new URL(urlString);
    const searchParams = new URLSearchParams(params);
    url.searchParams.forEach((value, name) => searchParams.append(name, value));
    const options = {
        hostname: url.hostname,
        port: url.port,
        path: `${url.pathname}?${searchParams.toString()}`,
    };
    return new Promise((resolve) => {
        http.get(options, function (res) {
            resolve(res);
        });
    });
}

/**
 * Given a http response, extract its body.
 */
function getResponseBody(response) {
    return new Promise((resolve) => {
        let data = '';
        response.on('data', function (chunk) {
            data += chunk;
        });
        response.on('end', function () {
            resolve(data);
        });
    });
}

export async function getTransactions(address, id = 0) {
    const response = await walletProxy.get(
        `/v0/accTransactions/${address}?limit=1000&from=${id}`
    );
    const { transactions, count, limit } = response.data;
    if (count === limit) {
        return transactions.push(
            getTransactions(address, getHighestId(transactions))
        );
    }
    return transactions;
}

export async function getIdentityProviders() {
    return walletProxy.get('/v0/ip_info');
}

export async function getGlobal() {
    const response = await walletProxy.get('/v0/global');
    return response.data;
}

/**
 * This function will perform an IdObjectRequest, and Intercept the redirect,
 * returning the location, that the Identity Provider attempted to redirect to.
 */
export async function performIdObjectRequest(
    url,
    redirectUri,
    idObjectRequest
) {
    const parameters = {
        response_type: 'code',
        redirect_uri: redirectUri,
        state: JSON.stringify({
            idObjectRequest,
        }),
    };
    const response = await getPromise(url, parameters);
    if (response.statusCode === 302) {
        const loc = response.headers.location;
        return loc.substring(loc.indexOf('=') + 1);
    }
    const message = await getResponseBody(response);
    throw new Error(`Request failed: ${message}`);
}

/**
 * Async timeout
 * time: timeout length, in milliseconds.
 */
export async function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

/**
 * This function should poll the given location, until the location returns an IdObject
 * TODO: Handle the service being unavailable
 */
export async function getIdObject(location) {
    while (true) {
        const response = await getPromise(location);
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
        await sleep(10000);
    }
}
