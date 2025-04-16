# Task Runner

+ [Task Runner](#task-runner)
  + [Зависимости](#зависимости)
  + [Установка и конфигурация](#установка-и-конфигурация)
  + [Запуск](#запуск)
  + [Описание](#описание)






## Зависимости

+ [Node.js 22+](https://nodejs.org/)






## Установка и конфигурация

1. Установка:
   ```bash
     npm i
   ```
2. Конфигурация - копирование `.env`-файла и внесение желаемых значений:
   ```bash
     cp .env.sample .env
   ```






## Запуск

1. Сборка:
   ```bash
     npm run build
   ```
2. Старт:
   ```bash
     npm start
   ```






## Описание

Решение заключается в отправке запросов пачками через определенный интервал времени,
которые определяются переменными `rate` и `batchSize` в классах раннеров.

Реализация выполнена 2 способами:
+ Через вызовы метода класса, файл `src/services/TaskRunner.ts`:
  ```ts
    runner.rate = 50; // Число задач в секунду
    runner.batchSize = 50; // Размер одной пачки
    runner.addTask({id, action: () => sampleTask(id)});
  ```
  Изменение полей класса реализовано через геттеры/сеттеры с целью выполнения
  дополнительных действий (логирование, вычисление `#interval`).

+ Через события, файл `src/services/EventTaskRunner.ts`.
  Здесь с целью избежания дублирования кода используется декоратор вокруг класса
  `TaskRunner` с имплементацией интерфейса `EventEmitter`:
  ```ts
    runner.emit('add-task', {id, action: () => sampleTask(id)});
    runner.emit('rate-change', 50);
  ```
  Действия в `TaskRunner` пробрасываются методом `forward()`:
  ```ts
    private forward() {
        this.on('add-task', task => this.#runner.addTask(task));
        ...
        this.on('rate-change', value => (this.#runner.rate = value));
    }
  ```

Для удобства тестирования сделан простейший класс логирования, `src/helpers/Logger.ts`
и небольшой CLI-интерфейс:
```bash
  Решение:
  r. Запуск TaskRunner
  e. Запуск EventTaskRunner
  q. Выход
  Выберите действие и нажмите Enter:
```

Дальнейшее возможное развитие - поддержка потоков через `Web Workers`/`cluster`/`worker_threads`,
а также расширение самих тасок, например, по приоритету:
```ts
  export interface Task {
      id: string;
      action: (...args: any[]) => Promise<any>;
      priority: number; // Приоритет
  }
```
