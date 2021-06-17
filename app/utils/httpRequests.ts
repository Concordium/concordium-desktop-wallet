import { IncomingTransaction } from './types';
import ipcCommands from '../constants/ipcCommands.json';

interface HttpResponse {
    body: string;
    statusCode: number;
    location?: string;
}

/**
 * Performs a HTTP get request using IPC to the main thread.
 * @param urlString the url at which to perform the http get request
 * @param params additional URL search parameters to add to the request
 * @returns an HttpResponse containing the body, status code and the redirect location if the status code was 302
 */
export async function httpGet(
    urlString: string,
    params: Record<string, string> = {}
): Promise<HttpResponse> {
    return window.ipcRenderer.invoke(ipcCommands.httpGet, urlString, params);
}

interface GetTransactionsOutput {
    transactions: IncomingTransaction[];
    full: boolean;
}

export async function getTransactions(
    address: string,
    id = 0
): Promise<GetTransactionsOutput> {
    return window.ipcRenderer.invoke(ipcCommands.getTransactions, address, id);
}

export async function getIdentityProviders() {
    return window.ipcRenderer.invoke(ipcCommands.getIdProviders);
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

    const response = await httpGet(url, parameters);
    if (response.statusCode === 302) {
        const { location } = response;
        if (!location) {
            throw new Error('Missing error from redirect response');
        }
        if (location[0] === '/') {
            const urlObject = new URL(url);
            return `https://${urlObject.hostname}${location}`;
        }
        return location;
    }
    throw new Error(`Request failed: ${response.body}`);
}

/**
 * Async timeout
 * time: timeout length, in milliseconds.
 */
export async function sleep(time: number) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

// TODO: Handle the service being unavailable better than keep spamming.
/**
 * Polls the provided location until a valid IdObject is returned
 */
export async function getIdObject(location: string) {
    // eslint-disable-next-line no-constant-condition
    while (true) {
        const response = await httpGet(location);
        const data = JSON.parse(response.body);
        switch (data.status) {
            case 'done':
                return data.token;
            case 'error':
                throw new Error(data.detail);
            case 'pending':
                break;
            default:
                throw new Error(`Unknown status: ${data.status}`);
        }
        await sleep(10000);
    }
}
