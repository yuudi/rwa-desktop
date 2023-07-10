import { existsSync, readFileSync, writeFile } from "fs";
import { join } from "path";
import { app } from "electron";
import { schedule, getTasks } from "node-cron";
import RC from "./rclone.js";

/**
 * @typedef {{id: string, active: boolean, schedule: string, method: string, params: any}} Task
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
    writeFile(this._filepath, JSON.stringify(value));
  }
}

class Schedular {
  /**
   *
   * @param {string} username
   * @param {string} password
   * @param {number} startupDelay
   */
  constructor(username, password, startupDelay = 0) {
    this._rc = new RC(username, password);
    this._storage = new SchedularStorage();
    const tasks = this._storage.get();
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
  _runTask(task) {
    this._rc.call(task.method, task.params);
  }

  /**
   *
   * @returns {Task[]}
   */
  getTasks() {
    return this._storage.get();
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
