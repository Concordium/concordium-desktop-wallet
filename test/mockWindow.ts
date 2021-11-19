// This mocks the methods added in the preload script.
// Currently just ensures that tests doesn't crash when importing DAO files.

Object.defineProperty(window, 'database', {
    get: jest.fn(() => ({
        account: {},
        credentials: {},
        identity: {},
        addressBook: {},
        wallet: {},
        externalCredential: {},
    })),
});

Object.defineProperty(window, 'grpc', {
    get: jest.fn(() => ({})),
});
