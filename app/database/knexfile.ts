import {
    getDevelopmentKnexConfiguration,
    fetchDevelopmentFilename,
} from './developmentKnexFile';
import {
    getProductionKnexConfiguration,
    getProductionFilename,
} from './productionKnexFile';

export async function getDatabaseFilename() {
    const environment = process.env.NODE_ENV;
    if (environment === 'development') {
        return fetchDevelopmentFilename();
    }
    return getProductionFilename();
}

export default async function getKnexConfiguration(
    environment: string,
    password: string
) {
    if (environment === 'development') {
        return getDevelopmentKnexConfiguration(password);
    }
    if (environment === 'production') {
        return getProductionKnexConfiguration(password);
    }
    throw new Error('Environment has to be development or production.');
}
