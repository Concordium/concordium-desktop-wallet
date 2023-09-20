/* eslint-disable import/prefer-default-export */
import { RegisterOptions } from 'react-hook-form';

export const passwordValidators: RegisterOptions = {
    required: 'Password is required',
    minLength: {
        value: 6,
        message: 'Password has to be at least 6 characters',
    },
    validate: {
        noQuotes: (password) =>
            !password.includes("'") ||
            "Password may not include single quote ' symbols",
    },
};
