export interface RunnerConfig {
    /** Число пачек задач в секунду */
    rate: number;

    /** Размер одной пачки */
    batchSize: number;
}

export type RunnerStatus = 'running' | 'stopped';

export interface Task {
    id: string;
    action: (...args: any[]) => Promise<any>;
}
