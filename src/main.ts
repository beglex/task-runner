import {createInterface} from 'node:readline';

import {getConfig, Logger, LogLevel, sampleTask} from './helpers';
import {EventTaskRunner, TaskRunner} from './services';

Logger.level = LogLevel.DEBUG;

const logger = new Logger('Main');
const config = getConfig();
let now = 0;

process.on('exit', () => {
    logger.info(`Lasting: ${Date.now() - now}ms`);
});

function startTaskRunner() {
    logger.info(`Starting ${TaskRunner.name}`);
    now = Date.now();

    const runner = new TaskRunner({rate: config.rate, batchSize: config.batchSize});

    for (let i = 0; i < config.totalTasks; i++) {
        const id = String(i);
        runner.addTask({id, action: () => sampleTask(id)});
    }

    setTimeout(() => {
        runner.rate = config.changeRateValue;
    }, config.changeRateTimeout);

    setTimeout(() => {
        runner.stop();
    }, config.stopTimeout);

    runner.start();
}

function startEventTaskRunner() {
    logger.info(`Starting ${EventTaskRunner.name}`);
    now = Date.now();

    const runner = new EventTaskRunner({rate: config.rate, batchSize: config.batchSize});

    for (let i = 0; i < config.totalTasks; i++) {
        const id = String(i);
        runner.emit('add-task', {id, action: () => sampleTask(id)});
    }

    setTimeout(() => {
        runner.emit('rate-change', config.changeRateValue);
    }, config.changeRateTimeout);

    setTimeout(() => {
        runner.emit('stop');
    }, config.stopTimeout);

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
