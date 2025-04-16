import type {RunnerConfig} from '../types';

export async function sampleTask(id = `${Date.now()}_${crypto.randomUUID()}`, delay = 500) {
    await new Promise(resolve => setTimeout(resolve, Math.random() * delay));
    if (Math.random() > 0.9) {
        throw new Error(`Task ${id} failed`);
    } else {
        return true;
    }
}

export function date(d = new Date()) {
    const options: Partial<Intl.DateTimeFormatOptions> = {
        hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3,
    };

    return new Intl.DateTimeFormat('ru-RU', options).format(d).replace(',', '.');
}

export function getConfig() {
    return {
        rate: Number(process.env.RATE) || 500,
        batchSize: Number(process.env.BATCH_SIZE) || 20,

        totalTasks: Number(process.env.TOTAL_TASKS) || 5000,
        changeRateValue: Number(process.env.CHANGE_RATE_VALUE) || 50,
        changeRateTimeout: Number(process.env.CHANGE_RATE_TIMEOUT) || 5000,
        stopTimeout: Number(process.env.STOP_TIMEOUT) || 12000,
    } satisfies RunnerConfig & Record<string, number>;
}
