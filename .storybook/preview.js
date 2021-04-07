import '../app/styles/app.global.scss';

export const parameters = {
    actions: { argTypesRegex: '^on[A-Z].*' },
    backgrounds: {
        default: 'light',
        values: [
            {
                name: 'light',
                value: '#fff',
            },
            {
                name: 'dark',
                value: '#000',
            },
        ],
    },
};
