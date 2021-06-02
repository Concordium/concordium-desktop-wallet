// eslint-disable-next-line import/no-webpack-loader-syntax
import terms from 'url-loader!@resources/html/terms.html';
import localStorageKeys from '~/constants/localStorage.json';
import { hashSha256 } from './serializationHelpers';

export const termsUrlBase64 = terms;

const getHash = (v: string) => hashSha256(Buffer.from(v)).toString();

export const storeTerms = (): void => {
    window.localStorage.setItem(
        localStorageKeys.TERMS_ACCEPTED,
        getHash(termsUrlBase64)
    );
};

const getAcceptedTerms = (): string | null => {
    return window.localStorage.getItem(localStorageKeys.TERMS_ACCEPTED);
};

export const hasAcceptedTerms = (): boolean => {
    const accepted = getAcceptedTerms();

    if (!accepted) {
        return false;
    }

    return accepted === getHash(termsUrlBase64);
};
