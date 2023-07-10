import { contextBridge, ipcRenderer } from "electron";
import * as info from "../package.json";

const RWA_DESKTOP = {
  version: info.version,
  executeId: () => ipcRenderer.invoke("execute-id"),
  schedular: {
    addTask: (task) => ipcRenderer.invoke("schedular-addTask", task),
    getTasks: () => ipcRenderer.invoke("schedular-getTasks"),
    activateTask: (id) => ipcRenderer.invoke("schedular-activateTask", id),
    deactivateTask: (id) => ipcRenderer.invoke("schedular-deactivateTask", id),
  },
};

contextBridge.exposeInMainWorld("RWA_DESKTOP", RWA_DESKTOP);
