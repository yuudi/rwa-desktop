"use strict";
import { spawn } from "child_process";
import {
  BrowserWindow,
  Notification as ElectronNotification,
  Menu,
  Tray,
  app,
  ipcMain,
  nativeImage,
  shell,
} from "electron";
import { join } from "path";
import { error } from "./logging.js";
import RC from "./rclone.js";
import Schedular from "./schedular.js";

const locked = app.requestSingleInstanceLock();
if (!locked) {
  app.quit();
}

const resourcesPath =
  process.env.NODE_ENV === "production" ? process.resourcesPath : __dirname;

const randomString = (length) => {
  const chars = "0123456789abcdefghijklmnopqrstuvwxyz";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const executeId = randomString(16);
const rcPassword = randomString(16);

const rc = new RC("rwa", rcPassword);
const schedular = new Schedular(rc, 3000);

const createWindow = () => {
  const window = new BrowserWindow({
    width: 800,
    height: 600,
    autoHideMenuBar: true,
    icon: join(resourcesPath, "bundle", "favicon.ico"),
    webPreferences: {
      preload: join(__dirname, "preload.js"),
    },
  });

  // external url should be opened in default browser
  window.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("http://localhost:5572")) {
      return { action: "allow" };
    }
    shell.openExternal(url);
    return { action: "deny" };
  });

  window.loadURL(`http://rwa:${rcPassword}@localhost:5572`);
};

const activeWindow = () => {
  const allWindow = BrowserWindow.getAllWindows();
  if (allWindow.length > 0) {
    allWindow[0].show();
  } else {
    createWindow();
  }
};

const quit = async () => {
  try {
    await rc.call("mount/unmountall");
    await rc.call("core/quit");
    backendProcess.kill();
  } catch (e) {
    error(e);
  } finally {
    app.quit();
  }
};

/** @type {ChildProcessWithoutNullStreams} */
let backendProcess;

app.whenReady().then(() => {
  // create tray
  const icon = nativeImage.createFromPath(
    join(resourcesPath, "bundle", "icon.ico")
  );
  const tray = new Tray(icon);

  const contextMenu = Menu.buildFromTemplate([
    { label: "open", click: activeWindow },
    { label: "exit", click: quit },
  ]);

  tray.setToolTip("rwa desktop");
  tray.on("click", activeWindow);
  tray.setContextMenu(contextMenu);

  // create backend process
  const exeBin = process.platform === "win32" ? "rclone.exe" : "rclone";
  const exePath = join(resourcesPath, "bundle", exeBin);
  const args = [
    "rcd",
    "--rc-web-gui",
    "--rc-web-gui-no-open-browser",
    "--rc-web-fetch-url",
    "https://s3.yuudi.dev/rwa/native/version.json",
    "--rc-web-gui-update",
    "--rc-addr",
    "localhost:5572",
    "--rc-user",
    "rwa",
    "--rc-pass",
    rcPassword,
  ];
  backendProcess = spawn(exePath, args);

  // handle ipc
  ipcMain.handle("execute-id", () => executeId);
  ipcMain.handle("schedular-validate", (event, expression) => {
    return schedular.validate(expression);
  });
  ipcMain.handle("schedular-addTask", (event, task) => {
    return schedular.addTask(task);
  });
  ipcMain.handle("schedular-getTasks", (event) => {
    return schedular.getTasks();
  });
  ipcMain.handle("schedular-removeTask", (event, id) => {
    return schedular.removeTask(id);
  });
  ipcMain.handle("schedular-activateTask", (event, id) => {
    return schedular.activateTask(id);
  });
  ipcMain.handle("schedular-deactivateTask", (event, id) => {
    return schedular.deactivateTask(id);
  });

  // create window
  createWindow();

  app.on("activate", activeWindow);
  app.on("second-instance", activeWindow);
});

app.on("window-all-closed", () => {
  // keep running on backend and notify user
  const notification = new ElectronNotification({
    title: "rwa desktop",
    body: "rwa desktop is running on background",
  });
  notification.show();
});
