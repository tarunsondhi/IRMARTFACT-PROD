import * as winston from 'winston';
import { config } from './index';

const timestamp = () => (new Date().toUTCString());

// provide various log responses
const logger = new winston.Logger({
    transports: [
        // Write to specific console
        new winston.transports.Console({
            name: 'console',
            level: config.LOGGER.LEVEL,
            timestamp: timestamp(),
            colorize: true,
            silent: config.LOGGER.SILENT
        })
    ]
});

logger.exitOnError = false;

export { logger };