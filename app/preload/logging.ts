import winston, { LeveledLogMethod } from 'winston';
import { ipcRenderer } from 'electron';
import ipcCommands from '~/constants/ipcCommands.json';
import { LoggingMethods, LogExtra } from './preloadTypes';

const LogLevels = {
    error: 0,
    warn: 1,
    info: 2,
    // http: 3,
    // verbose: 4,
    // debug: 5,
    // silly: 6,
};

const logFileName = 'info.log';

const logger = winston.createLogger({
    levels: LogLevels,
    format: winston.format.combine(
        winston.format.json(),
        winston.format.errors({ stack: true }),
        winston.format.prettyPrint(),
        winston.format.colorize(),
        winston.format.timestamp()
    ),
    transports: [],
});

// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
if (process.env.NODE_ENV !== 'production') {
    logger.add(
        new winston.transports.Console({
            format: winston.format.simple(),
        })
    );
}

ipcRenderer
    .invoke(ipcCommands.getUserDataPath)
    .then((userDataPath) =>
        logger.add(
            new winston.transports.File({
                filename: `${userDataPath}/${logFileName}`,
            })
        )
    )
    .catch(() => {});

function log(f: LeveledLogMethod, first: string | Error, extra: LogExtra) {
    return typeof first === 'string' ? f(first, extra) : f(first);
}

const methods: LoggingMethods = {
    info: (...args) => log(logger.info, ...args),
    warn: (...args) => log(logger.warn, ...args),
    error: (...args) => log(logger.error, ...args),
};

export default methods;
