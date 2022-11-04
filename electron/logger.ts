import { createLogger, format, transports } from 'winston';
import { log_level } from './config';
import { name } from '../package.json';

export const logger = createLogger({
    level: log_level,
    format: format.json(),
    defaultMeta: { service: name },
    transports: [
        new transports.Console({
            format: format.simple(),
        })
    ],
});
