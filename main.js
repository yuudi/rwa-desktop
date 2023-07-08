const {
  app,
  shell,
  BrowserWindow,
  Menu,
  Tray,
  nativeImage,
  Notification,
} = require("electron");
const { spawn } = require("child_process");
const path = require("path");

const locked = app.requestSingleInstanceLock();
if (!locked) {
  app.quit();
}

const randomString = (length) => {
  const chars = "0123456789abcdefghijklmnopqrstuvwxyz";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const rcPassword = randomString(16);

const createWindow = () => {
  const window = new BrowserWindow({
    width: 800,
    height: 600,
    autoHideMenuBar: true,
    icon: path.join(process.resourcesPath, "bundle", "favicon.ico"),
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

app.whenReady().then(() => {
  // create tray
  const icon = nativeImage.createFromPath(
    path.join(process.resourcesPath, "bundle", "favicon.ico")
  );
  const tray = new Tray(icon);

  const contextMenu = Menu.buildFromTemplate([
    { label: "open", click: activeWindow },
    { label: "exit", click: () => app.quit() },
  ]);

  tray.setToolTip("rwa desktop");
  tray.setContextMenu(contextMenu);

  // create backend process
  const exePath = path.join(
    process.resourcesPath,
    "bundle",
    process.platform === "win32" ? "rclone.exe" : "rclone"
  );
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
  const backend = spawn(exePath, args);

  // create window
  createWindow();

  app.on("activate", activeWindow);
  app.on("second-instance", activeWindow);
});

app.on("window-all-closed", () => {
  // keep running on backend and notify user
  const notification = new Notification({
    title: "rwa desktop",
    body: "rwa desktop is running on background",
  });
  notification.show();
});
