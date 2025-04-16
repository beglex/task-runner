import type {RunnerConfig, RunnerStatus, Task} from '../types';

import {Logger} from '../helpers';

export class TaskRunner {
    #rate = 100;
    #batchSize = 100;
    #interval = 1000 / (this.#rate / this.#batchSize);

    #tasks: Record<string, Task> = {};
    #taskQueue: string[] = [];

    #status: RunnerStatus = 'stopped';
    #timerId: NodeJS.Timeout | null = null;

    logger = new Logger(TaskRunner.name);

    constructor(config: Partial<RunnerConfig>) {
        this.#rate = config.rate || 100;
        this.#batchSize = config.batchSize || 100;
        this.#interval = 1000 / (this.#rate / this.#batchSize);

        this.logger.info(`Rate: ${this.#rate} tasks/sec, batch size: ${this.#batchSize}`);
    }

    get rate() {
        return this.#rate;
    }

    set rate(value: number) {
        this.#rate = value;
        this.#interval = 1000 / (this.#rate / this.#batchSize);

        this.logger.info(`Rate: ${value} tasks/sec`);

        if (this.#status === 'running') {
            this.restart();
        }
    }

    get batchSize() {
        return this.#batchSize;
    }

    set batchSize(value: number) {
        this.#batchSize = value;
        this.#interval = 1000 / (this.#rate / this.#batchSize);

        this.logger.info(`Batch size: ${value} tasks`);

        if (this.#status === 'running') {
            this.restart();
        }
    }

    addTask(task: Task | (() => Promise<void>)) {
        const fullTask = typeof task === 'function'
            ? {id: crypto.randomUUID(), action: task}
            : task;

        this.#tasks[fullTask.id] = fullTask;
        this.#taskQueue.push(fullTask.id);

        this.logger.debug(`Task added: ${fullTask.id}`);

        return fullTask.id;
    }

    removeTask(id: Task['id']) {
        if (!this.#tasks[id]) {
            this.logger.warning(`Task not found: ${id}`);
            return false;
        }

        delete this.#tasks[id];
        this.#taskQueue = Object.keys(this.#tasks);

        this.logger.info(`Task removed: ${id}`);
        return true;
    }

    clearTasks(): void {
        this.#tasks = {};
        this.#taskQueue = [];

        this.logger.info('All tasks are cleared');
    }

    private async executeTask(id: string) {
        const task = this.#tasks[id];
        if (!task) {
            this.logger.warning(`Task not found: ${id}`);
            return;
        }

        try {
            await task.action();
            this.logger.debug(`Task completed: ${id}`);
        } catch (err: any) {
            this.logger.warning(`Error executing task ${id}:`, err.message);
        }
    }

    private async executeBatch(): Promise<void> {
        const tasks = this.#taskQueue.slice(0, Math.min(this.#batchSize, this.#taskQueue.length));
        if (!tasks.length) {
            this.logger.info('No tasks in queue');
            return;
        }

        this.logger.debug(`Executing ${tasks.length} tasks`);

        const results = await Promise.allSettled(
            tasks.map(id => this.executeTask(id)),
        );

        this.#taskQueue = this.#taskQueue.filter(id => !tasks.includes(id));

        const {length: succeeds} = results.filter(r => r.status === 'fulfilled');

        this.logger.info(`Batch executed: ${succeeds}/${tasks.length} tasks succeeded`);
    }

    private async run() {
        if (this.#status === 'stopped') {
            return;
        }

        try {
            this.executeBatch();

            this.#timerId = setTimeout(() => this.run(), this.#interval);
        } catch (err: any) {
            // Чисто теоретически этот блок никогда не выполнится в силу наличия try..catch в executeTask,
            // но есть очень небольшая вероятность, если система нагружена под 100%
            this.logger.warning(`Error executing batch:`, err.message);
        }
    }

    private restart() {
        this.logger.info('Restarting');

        this.stop();
        this.start();
    }

    start() {
        if (this.#status === 'running') {
            this.logger.warning('Already running');
            return;
        }

        this.logger.info('Starting');

        this.#status = 'running';

        this.run();
    }

    stop() {
        if (this.#status === 'stopped') {
            this.logger.warning('Not running');
            return;
        }

        this.#status = 'stopped';
        if (this.#timerId) {
            clearTimeout(this.#timerId);
            this.#timerId = null;
        }

        this.logger.info('Stopped');
    }
}
