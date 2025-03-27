export const defaultAccount: typeof window.database.preferences.defaultAccount = {
    get() {
        return window.database.preferences.defaultAccount.get();
    },
    set(value) {
        return window.database.preferences.defaultAccount.set(value);
    }
};
export const accountSimpleView: typeof window.database.preferences.accountSimpleView = {
    get() {
        return window.database.preferences.accountSimpleView.get();
    },
    set(value) {
        return window.database.preferences.accountSimpleView.set(value);
    }
};
