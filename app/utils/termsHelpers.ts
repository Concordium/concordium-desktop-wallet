import { Buffer } from 'buffer/';

// eslint-disable-next-line import/no-webpack-loader-syntax
import terms from 'url-loader!@resources/html/terms.html';
import localStorageKeys from '~/constants/localStorage.json';

export const termsUrlBase64 = terms;

const getHash = async (v: string) => {
    return Buffer.from(window.cryptoMethods.sha256([Buffer.from(v)])).toString(
        'hex'
    );
};

export const storeTerms = async (): Promise<void> => {
    const hash = await getHash(termsUrlBase64);
    window.localStorage.setItem(localStorageKeys.TERMS_ACCEPTED, hash);
};

const getAcceptedTerms = (): string | null => {
    return window.localStorage.getItem(localStorageKeys.TERMS_ACCEPTED);
};

export const hasAcceptedTerms = async (): Promise<boolean> => {
    const accepted = getAcceptedTerms();

    if (!accepted) {
        return false;
    }

    const hash = await getHash(termsUrlBase64);
    return accepted === hash;
};
