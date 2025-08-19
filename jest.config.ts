import { JestConfigWithTsJest, createJsWithTsEsmPreset } from 'ts-jest';

const presetConfig = createJsWithTsEsmPreset();

const esModules = [
    '@concordium/web-sdk/plt',
    '@concordium/web-sdk',
    '@concordium/rust-bindings',
    '@noble/ed25519',
    'cbor2',
].join('|');

const jestConfig: JestConfigWithTsJest = {
    ...presetConfig,
    testEnvironment: 'jsdom',
    testEnvironmentOptions: {
        url: 'http://localhost/',
    },
    moduleNameMapper: {
        '^@concordium/web-sdk/plt/(.*)$':
            '<rootDir>/node_modules/@concordium/web-sdk/lib/esm/plt/$1',
        '^@concordium/web-sdk$':
            '<rootDir>/node_modules/@concordium/web-sdk/lib/min/concordium.web.min.js',
        '^~/(.*)$': '<rootDir>/app/$1',
    },

    transform: {
        // For the listed ESM modules in `node_modules` folder, process them with `babel-jest`
        [`^.+/node_modules/(?:${esModules})/.+\\.js$`]: 'babel-jest',

        // For .ts and .tsx files in the desktop wallet repo code, process them with `ts-jest`
        '^.+\\.(ts|tsx)$': [
            'ts-jest',
            { tsconfig: 'tsconfig.json', useESM: true },
        ],
    },

    // Skips all transformation in `node_modules` folder except the ESM modules from the list
    transformIgnorePatterns: [`node_modules/(?!${esModules})`],

    moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],
    moduleDirectories: ['node_modules', 'app/node_modules'],
    setupFiles: [
        './internals/scripts/CheckBuildsExist.js',
        './test/polyfills.ts',
    ],
    workerThreads: true,
};

export default jestConfig;
