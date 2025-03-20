import {
    IdObjectRequest,
    TransactionFilter,
    TransactionOrder,
    Versioned,
} from './types';
import {
    DoneIdentityTokenContainer,
    IdentityProviderIdentityStatus,
    IdentityTokenContainer,
    ErrorIdentityTokenContainer,
} from './id/types';
import { throwLoggedError } from './basicHelpers';

/**
 * Performs a HTTP get request using IPC to the main thread.
 * @param urlString the url at which to perform the http get request
 * @param params additional URL search parameters to add to the request
 * @returns an HttpGetResponse containing the body, status code and the returned headers
 */
export async function httpGet<T>(
    urlString: string,
    params: Record<string, string> = {}
) {
    return window.http.get<T>(urlString, params);
}

export async function gtuDrop(address: string) {
    return window.http.gtuDrop(address);
}

export async function getTransactionsAscending(
    address: string,
    transactionFilter: TransactionFilter,
    limit: number,
    id?: string
) {
    return window.http.getTransactions(
        address,
        transactionFilter,
        limit,
        TransactionOrder.Ascending,
        id
    );
}

export async function getTransactionsDescending(
    address: string,
    transactionFilter: TransactionFilter,
    limit: number,
    id?: string
) {
    return window.http.getTransactions(
        address,
        transactionFilter,
        limit,
        TransactionOrder.Descending,
        id
    );
}

export async function getIdentityProviders() {
    const providers = await window.http.getIdProviders();
    for (const p of providers) {
        if (p.ipInfo.ipDescription.name.includes('Digital Trust Solutions')) {
            p.ipInfo.ipDescription.name =
                p.ipInfo.ipDescription.name +
                ' (http://localhost:5247/entry/stg)';
            p.metadata.issuanceStart = 'http://localhost:5247/entry/stg';
        }
    }
    console.log({ providers });
    return providers;
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
    let response;
    try {
        response = await httpGet(url, parameters);
    } catch (e) {
        throwLoggedError(`Unable to perform Id Object Request: ${e}`);
    }
    if (response.status === 302) {
        const { location } = response.headers;
        if (!location) {
            throwLoggedError('Missing location from redirect response');
        }
        if (location[0] === '/') {
            const urlObject = new URL(url);
            return `https://${urlObject.hostname}${location}`;
        }
        return location;
    }
    return throwLoggedError(
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
