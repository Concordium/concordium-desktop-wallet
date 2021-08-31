import { SIMPLE_ACCOUNT_VIEW } from '~/constants/localStorage.json';

export function setSimpleViewActive(isActive: boolean) {
    window.localStorage.setItem(SIMPLE_ACCOUNT_VIEW, JSON.stringify(isActive));
}

export function getSimpleViewActive(): boolean {
    try {
        return JSON.parse(
            window.localStorage.getItem(SIMPLE_ACCOUNT_VIEW) ?? 'true'
        );
    } catch {
        return true;
    }
}
