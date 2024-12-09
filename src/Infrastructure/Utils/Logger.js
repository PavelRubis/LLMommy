import { Configuration } from './Configuration.js';
import pino from 'pino';

const fileTransport = pino.transport({
    target: 'pino/file',
    options: { destination: './logs/execution.json' }
});

export const Logger = pino(
    {
        level: Configuration.get('LOG_LEVEL') || 'info',
        formatters: {
            level: label => {
                return { level: label.toUpperCase() };
            }
        },
        timestamp: pino.stdTimeFunctions.isoTime
    },
    fileTransport
);
