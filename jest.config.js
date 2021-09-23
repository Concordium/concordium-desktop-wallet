module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    testURL: 'http://localhost/',
    moduleNameMapper: {
        '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
            '<rootDir>/internals/mocks/fileMock.js',
        '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
        '^~/(.*)$': '<rootDir>/app/$1',
    },
    moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],
    moduleDirectories: ['node_modules', 'app/node_modules'],
    setupFiles: [
        './internals/scripts/CheckBuildsExist.js',
        './test/loadModules.ts',
    ],
    globals: {
        'ts-jest': {
            tsconfig: 'tsconfig.jest.json',
            babelConfig: {
                plugins: [
                    '@babel/plugin-proposal-optional-chaining',
                    '@babel/plugin-proposal-nullish-coalescing-operator',
                ],
            },
        },
    },
};
