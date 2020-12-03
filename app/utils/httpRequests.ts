import * as axios from 'axios';
import * as http from 'http';

const walletProxy = axios.create({
    baseURL: 'http://wallet-proxy.eu.staging.concordium.com/',
});

function getPromise(urlString, params) {
    console.log(urlString);
    const url = new URL(urlString);
    const options = {
        hostname: url.hostname,
        port: url.port,
        path: `${url.pathname}?${new URLSearchParams(params).toString()}`,
    };
    console.log(options);
    return new Promise((resolve, reject) => {
        http.get(options, function (res) {
            resolve(res);
        });
    });
}

function getResponseBody(response) {
    return new Promise((resolve, reject) => {
        let data = '';
        response.on('data', function (chunk) {
            data += chunk;
        });
        response.on('end', function () {
            resolve(data);
        });
    });
}

export async function getIdentityProviders() {
    return walletProxy.get('/v0/ip_info');
}

export async function getGlobal() {
    const response = await walletProxy.get('/v0/global');
    return response.data;
}

export async function performIdObjectRequest(
    url,
    redirectUri,
    idObjectRequest
) {
    const parameters = {
        response_type: 'code',
        redirect_uri: redirectUri,
        state: JSON.stringify({
            idObjectRequest: idObjectRequest,
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

async function pollIdObject(location) {
    const response = await getPromise(location);
    console.log(response);
    const data = await getResponseBody(response);
    console.log(data);
    return JSON.parse(data);
}

async function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

export async function getIdObject(location) {
    while (true) {
        console.log("--");
        const data = await pollIdObject(location);
        switch (data.status) {
            case 'done':
                return data.token;
            case 'error':
                throw new Error(data.detail);
            case 'pending':
                break;
            default:
                throw new Error('unexpected status: ' + data.status);
        }
        await sleep(10000);
    }
}
