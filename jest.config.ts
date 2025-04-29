import { JestConfigWithTsJest, createJsWithTsEsmPreset } from 'ts-jest';

const presetConfig = createJsWithTsEsmPreset();

const jestConfig: JestConfigWithTsJest = {
    ...presetConfig,
    testEnvironment: 'jsdom',
    testEnvironmentOptions: {
        url: 'http://localhost/',
    },
    moduleNameMapper: {
        '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
            '<rootDir>/internals/mocks/fileMock.js',
        '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
        '^~/(.*)$': '<rootDir>/app/$1',
        '@concordium/web-sdk':
            '<rootDir>/node_modules/@concordium/web-sdk/lib/min/concordium.web.min.js',
    },
    moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],
    moduleDirectories: ['node_modules', 'app/node_modules'],
    setupFiles: [
        './internals/scripts/CheckBuildsExist.js',
        './test/loadModules.ts',
    ],
    workerThreads: true,
};

export default jestConfig;
