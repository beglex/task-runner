import {date} from './utils';

export enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARNING = 2,
}

const padding = 24;

export class Logger {
    static level = LogLevel.DEBUG;

    private className = '';

    static debug(...args: any[]) {
        if (this.level <= LogLevel.DEBUG) {
            console.debug(`[${date()} DEBUG] `.padEnd(padding, ' '), ...args);
        }
    }

    static info(...args: any[]) {
        if (this.level <= LogLevel.INFO) {
            console.log(`[${date()} INFO] `.padEnd(padding, ' '), ...args);
        }
    }

    static warning(...args: any[]) {
        if (this.level <= LogLevel.WARNING) {
            console.warn(`[${date()} WARNING] `.padEnd(padding, ' '), ...args);
        }
    }

    constructor(name = '') {
        this.className = name;
    }

    debug(...args: any[]) {
        Logger.debug(`[${this.className}] `, ...args);
    }

    info(...args: any[]) {
        Logger.info(`[${this.className}] `, ...args);
    }

    warning(...args: any[]) {
        Logger.warning(`[${this.className}] `, ...args);
    }
}
