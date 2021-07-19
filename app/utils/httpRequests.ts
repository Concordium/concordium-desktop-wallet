import { IdObjectRequest, IncomingTransaction, Versioned } from './types';
import ipcCommands from '../constants/ipcCommands.json';
import {
    DoneIdentityTokenContainer,
    IdentityProviderIdentityStatus,
    IdentityTokenContainer,
    ErrorIdentityTokenContainer,
} from './id/types';

interface HttpGetResponse<T> {
    data: T;
    headers: Record<string, string>;
    status: number;
}

/**
 * Performs a HTTP get request using IPC to the main thread.
 * @param urlString the url at which to perform the http get request
 * @param params additional URL search parameters to add to the request
 * @returns an HttpGetResponse containing the body, status code and the returned headers
 */
export async function httpGet<T>(
    urlString: string,
    params: Record<string, string> = {}
): Promise<HttpGetResponse<T>> {
    const response: string = await window.ipcRenderer.invoke(
        ipcCommands.httpGet,
        urlString,
        params
    );
    return JSON.parse(response);
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
 * This function will send an IdObjectRequest to an identity provider and intercept the
 * redirect returned to extract the location that the Identity Provider attempted to redirect to.
 * @returns the redirect location where the identity object can be polled from
 */
export async function performIdObjectRequest(
    url: string,
    redirectUri: string,
    idObjectRequest: Versioned<IdObjectRequest>
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
    if (response.status === 302) {
        const { location } = response.headers;
        if (!location) {
            throw new Error('Missing location from redirect response');
        }
        if (location[0] === '/') {
            const urlObject = new URL(url);
            return `https://${urlObject.hostname}${location}`;
        }
        return location;
    }
    throw new Error(
        `The identity provider did not return a 302 Redirect as expected: ${response.data}`
    );
}

/**
 * Async timeout
 * time: timeout length, in milliseconds.
 */
export async function sleep(time: number) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

export interface ErrorIdObjectResponse {
    error: Error;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    token?: null;
}
export interface DoneIdObjectResponse {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    token: any;
    error?: null;
}

export type IdObjectResponse = ErrorIdObjectResponse | DoneIdObjectResponse;

/**
 * Polls the provided location until a valid identity object
 * is available, or that an error is returned.
 *
 * The method has to continue polling until the identity provider returns
 * a concluding status. This is required to prevent the loss of an identity,
 * i.e. an identity was eventually successful at the identity provider, but
 * was already failed locally in the desktop wallet beforehand.
 *
 * @returns the identity object
 */
export async function getIdObject(location: string): Promise<IdObjectResponse> {
    // eslint-disable-next-line no-constant-condition
    while (true) {
        try {
            const response = await httpGet<IdentityTokenContainer>(location);
            const { data } = response;
            if (
                data.status &&
                (data.status === IdentityProviderIdentityStatus.Error ||
                    data.status === IdentityProviderIdentityStatus.Done)
            ) {
                const tokenContainer:
                    | DoneIdentityTokenContainer
                    | ErrorIdentityTokenContainer = data;

                if (
                    tokenContainer.status ===
                    IdentityProviderIdentityStatus.Done
                ) {
                    return { token: data.token };
                }
                if (
                    tokenContainer.status ===
                    IdentityProviderIdentityStatus.Error
                ) {
                    return {
                        error: new Error(data.detail),
                    };
                }
            }
            await sleep(10000);
        } catch (error) {
            await sleep(10000);
        }
    }
}
