import {EventEmitter} from 'node:events';

import type {RunnerConfig, Task} from '../types';

import {TaskRunner} from './TaskRunner';

interface TaskEvents {
    'add-task': (task: Task | (() => Promise<void>)) => string;
    'remove-task': (id: Task['id']) => boolean;
    'clear-tasks': () => void;
    'start': () => void;
    'stop': () => void;
    'rate-change': (value: number) => void;
    'batch-size-change': (value: number) => void;
}

export class EventTaskRunner extends EventEmitter {
    #runner: TaskRunner;

    declare emit: <E extends keyof TaskEvents>(event: E, ...args: Parameters<TaskEvents[E]>) => boolean;
    declare on: <E extends keyof TaskEvents>(event: E, listener: TaskEvents[E]) => this;
    declare once: <E extends keyof TaskEvents>(event: E, listener: TaskEvents[E]) => this;

    constructor(config: Partial<RunnerConfig>) {
        super();

        this.#runner = new TaskRunner(config);

        this.forward();
    }

    private forward() {
        this.on('add-task', task => this.#runner.addTask(task));
        this.on('remove-task', id => this.#runner.removeTask(id));
        this.on('clear-tasks', () => this.#runner.clearTasks());

        this.on('rate-change', value => (this.#runner.rate = value));
        this.on('batch-size-change', value => (this.#runner.batchSize = value));

        this.on('start', () => this.#runner.start());
        this.on('stop', () => this.#runner.stop());

        Object.defineProperty(this, 'rate', {
            get: () => this.#runner.rate, enumerable: true, configurable: true,
        });
        Object.defineProperty(this, 'batchSize', {
            get: () => this.#runner.batchSize, enumerable: true, configurable: true,
        });
    }
}
