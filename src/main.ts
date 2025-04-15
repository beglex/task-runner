import {createInterface} from 'node:readline';

import {Logger, LogLevel, sampleTask} from './helpers';
import {EventTaskRunner, TaskRunner} from './services';

Logger.level = LogLevel.DEBUG;

const logger = new Logger('Main');
let now = 0;

process.on('exit', () => {
    logger.info(`Lasting: ${Date.now() - now}ms`);
});

function startTaskRunner() {
    logger.info(`Starting ${TaskRunner.name}`);
    now = Date.now();

    const runner = new TaskRunner({rate: 500, batchSize: 50});

    for (let i = 0; i < 5000; i++) {
        const id = String(i);
        runner.addTask({id, action: () => sampleTask(id)});
    }

    setTimeout(() => {
        runner.rate = 50;
    }, 5000);

    setTimeout(() => {
        runner.stop();
    }, 12000);

    runner.start();
}

function startEventTaskRunner() {
    logger.info(`Starting ${EventTaskRunner.name}`);
    now = Date.now();

    const runner = new EventTaskRunner({rate: 5, batchSize: 2});

    for (let i = 0; i < 5000; i++) {
        const id = String(i);
        runner.emit('add-task', {id, action: () => sampleTask(id)});
    }

    setTimeout(() => {
        runner.emit('rate-change', 50);
    }, 5000);

    setTimeout(() => {
        runner.emit('stop');
    }, 12000);

    runner.emit('start');
}

(async () => {
    const menu: Record<string, {name: string; run: () => void}> = {
        r: {name: `Запуск ${TaskRunner.name}`, run: () => startTaskRunner()},
        e: {name: `Запуск ${EventTaskRunner.name}`, run: () => startEventTaskRunner()},
        q: {name: 'Выход', run: () => process.exit(0)},
    };

    const rl = createInterface({input: process.stdin, output: process.stdout});

    console.log('Решение:');
    Object.entries(menu).forEach(
        ([k, v]) => console.log(`${k}. ${v.name}`));
    console.log('Выберите действие и нажмите Enter: ');

    rl.on('line', async (text) => {
        if (menu[text]) {
            menu[text].run();
            rl.close();
        } else {
            console.log('Попробуйте снова:');
        }
    });
})();
