import { app } from "electron";
import { existsSync, readFileSync, writeFile } from "fs";
import { getTasks, schedule, validate } from "node-cron";
import { join } from "path";
import { log } from "./logging.js";
import RC from "./rclone.js";

/**
 * @typedef {{id: string, active: boolean, schedule: string, operation: string, params: any}} Task
 */

class SchedularStorage {
  constructor() {
    /** @type {Task[]} */
    this._value = [];
    this._filepath = join(app.getPath("userData"), "schedular.json");
    this.load();
  }
  load() {
    if (existsSync(this._filepath)) {
      this._value = JSON.parse(readFileSync(this._filepath));
    }
  }
  get() {
    return this._value;
  }
  set(value) {
    this._value = value;
    writeFile(this._filepath, JSON.stringify(value), () => {});
  }
}

class Schedular {
  /**
   *
   * @param {RC} rc
   * @param {number} startupDelay
   */
  constructor(rc, startupDelay = 0) {
    this._rc = rc;
    this._storage = new SchedularStorage();
    const tasks = this._storage.get();
    log(`schedular: ${tasks.length} tasks loaded`);
    setTimeout(() => this._initTasks(tasks), startupDelay);
  }

  /**
   *
   * @param {Task[]} tasks
   */
  _initTasks(tasks) {
    for (const task of tasks) {
      if (!task.active) {
        continue;
      }
      if (task.schedule === "@startup") {
        this._runTask(task);
      } else {
        schedule(task.schedule, () => this._runTask(task));
      }
    }
  }

  /**
   *
   * @param {Task} task
   */
  async _runTask(task) {
    const result = await this._rc.call(task.operation, task.params);
    log(
      `schedular: task ${task.operation} (${
        task.id
      }) executed, result: ${JSON.stringify(result)}`
    );
  }

  /**
   *
   * @returns {Task[]}
   */
  getTasks() {
    return this._storage.get();
  }

  validate(expression) {
    return validate(expression);
  }

  /**
   *
   * @param {Task} task
   */
  addTask(task) {
    this._storage.set([...this._storage.get(), task]);
    if (task.active && task.schedule !== "@startup") {
      schedule(task.schedule, () => this._runTask(task));
    }
  }

  /**
   *
   * @param {string} id
   * @returns
   */
  removeTask(id) {
    const tasks = this._storage.get();
    const index = tasks.findIndex((task) => task.id === id);
    if (index === -1) {
      return;
    }
    if (tasks[index].schedule !== "@startup") {
      getTasks().get(id)?.stop();
    }
    tasks.splice(index, 1);
    this._storage.set(tasks);
  }

  /**
   *
   * @param {string} id
   */
  activateTask(id) {
    const tasks = this._storage.get();
    const task = tasks.find((task) => task.id === id);
    if (task === undefined) {
      return;
    }
    task.active = true;
    this._storage.set(tasks);
    if (task.schedule !== "@startup") {
      schedule(task.schedule, () => this._runTask(task));
    }
  }

  /**
   *
   * @param {string} id
   */
  deactivateTask(id) {
    const tasks = this._storage.get();
    const task = tasks.find((task) => task.id === id);
    if (task === undefined) {
      return;
    }
    task.active = false;
    this._storage.set(tasks);
    if (task.schedule !== "@startup") {
      getTasks().get(id)?.stop();
    }
  }

  /**
   *
   * @param {string} id
   */
  deleteTask(id) {
    const task = this._storage.get().find((task) => task.id === id);
    if (task === undefined) {
      return;
    }
    if (task.schedule !== "@startup") {
      getTasks().get(id)?.stop();
    }
  }
}

export default Schedular;
