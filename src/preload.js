import { contextBridge, ipcRenderer } from "electron";
import * as info from "../package.json";

const RWA_DESKTOP = {
  version: info.version,
  executeId: () => ipcRenderer.invoke("execute-id"),
  schedular: {
    validate: (expression) =>
      ipcRenderer.invoke("schedular-validate", expression),
    addTask: (task) => ipcRenderer.invoke("schedular-addTask", task),
    getTasks: () => ipcRenderer.invoke("schedular-getTasks"),
    removeTask: (id) => ipcRenderer.invoke("schedular-removeTask", id),
    activateTask: (id) => ipcRenderer.invoke("schedular-activateTask", id),
    deactivateTask: (id) => ipcRenderer.invoke("schedular-deactivateTask", id),
  },
};

contextBridge.exposeInMainWorld("RWA_DESKTOP", RWA_DESKTOP);
