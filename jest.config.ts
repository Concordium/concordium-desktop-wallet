import { JestConfigWithTsJest, createJsWithTsEsmPreset } from 'ts-jest';

const presetConfig = createJsWithTsEsmPreset();

const jestConfig: JestConfigWithTsJest = {
    ...presetConfig,
    testEnvironment: 'jsdom',
    testEnvironmentOptions: {
        url: 'http://localhost/',
    },
    moduleNameMapper: {
        '^@concordium/web-sdk$':
            '<rootDir>/node_modules/@concordium/web-sdk/lib/min/concordium.web.min.js',
        '^~/(.*)$': '<rootDir>/app/$1',
    },

    moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],
    moduleDirectories: ['node_modules', 'app/node_modules'],
    setupFiles: [
        './internals/scripts/CheckBuildsExist.js',
        './test/polyfills.ts',
    ],
    workerThreads: true,
};

export default jestConfig;
