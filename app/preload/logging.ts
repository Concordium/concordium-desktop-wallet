import winston, { LeveledLogMethod } from 'winston';
import { ipcRenderer } from 'electron';
import ipcCommands from '~/constants/ipcCommands.json';
import { LoggingMethods, PutLog } from './preloadTypes';
import constants from '~/constants/logConstants.json';

const { fileName, maxsize, maxFiles } = constants;

const LogLevels = {
    error: 0,
    warn: 1,
    info: 2,
    // http: 3,
    // verbose: 4,
    // debug: 5,
    // silly: 6,
};

const logger = winston.createLogger({
    levels: LogLevels,
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors(),
        winston.format.json()
    ),
    transports: [],
});

// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
if (process.env.NODE_ENV !== 'production') {
    logger.add(
        new winston.transports.Console({
            format: winston.format.simple(),
            handleExceptions: true,
        })
    );
}

ipcRenderer
    .invoke(ipcCommands.getUserDataPath)
    .then((userDataPath) =>
        logger.add(
            new winston.transports.File({
                filename: `${userDataPath}/${fileName}`,
                maxsize,
                maxFiles,
                tailable: true,
                handleExceptions: true,
            })
        )
    )
    .catch(() => {});

/**
 * A function to allow using the loggers overload without type errors;
 */
function log(f: LeveledLogMethod, ...args: Parameters<PutLog>) {
    const first = args[0];
    if (args.length === 2) {
        return f(args[1], { error: first.toString() });
    }
    if (typeof first === 'string') {
        return f(first);
    }
    return f('', { error: first.toString() });
}

const methods: LoggingMethods = {
    info: (...args) => log(logger.info, ...args),
    warn: (...args) => log(logger.warn, ...args),
    error: (...args) => log(logger.error, ...args),
};

export default methods;
