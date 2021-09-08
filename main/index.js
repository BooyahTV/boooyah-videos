// Modules to control application life and create native browser window
const { Menu, app, BrowserWindow, ipcMain } = require("electron");

const pjson = require('../package.json');

const settings = require("electron-settings");

const { autoUpdater } = require("electron-updater");

const isDev = require("electron-is-dev");

const menu = require("./menu");
const links = require("./links");

const booyah = require("./booyah");

const { openReleaseNotes } = require("./release_notes");

var mainWindow;

try {
  if (isDev) {
    require("electron-reloader")(module);
  }
} catch (_) {}

// this should be placed at top of main.js to handle setup events quickly
if (handleSquirrelEvent()) {
  // squirrel event handled and app will exit in 1000ms, so don't do anything else
  return;
}

function handleSquirrelEvent() {
  if (process.argv.length === 1) {
    return false;
  }

  const ChildProcess = require("child_process");
  const path = require("path");

  const appFolder = path.resolve(process.execPath, "..");
  const rootAtomFolder = path.resolve(appFolder, "..");
  const updateDotExe = path.resolve(path.join(rootAtomFolder, "Update.exe"));
  const exeName = path.basename(process.execPath);

  const spawn = function (command, args) {
    let spawnedProcess, error;

    try {
      spawnedProcess = ChildProcess.spawn(command, args, { detached: true });
    } catch (error) {}

    return spawnedProcess;
  };

  const spawnUpdate = function (args) {
    return spawn(updateDotExe, args);
  };

  const squirrelEvent = process.argv[1];
  switch (squirrelEvent) {
    case "--squirrel-install":
    case "--squirrel-updated":
      // Optionally do things such as:
      // - Add your .exe to the PATH
      // - Write to the registry for things like file associations and
      //   explorer context menus

      // Install desktop and start menu shortcuts
      spawnUpdate(["--createShortcut", exeName]);

      setTimeout(app.quit, 1000);
      return true;

    case "--squirrel-uninstall":
      // Undo anything you did in the --squirrel-install and
      // --squirrel-updated handlers

      // Remove desktop and start menu shortcuts
      spawnUpdate(["--removeShortcut", exeName]);

      setTimeout(app.quit, 1000);
      return true;

    case "--squirrel-obsolete":
      // This is called on the outgoing version of your app before
      // we update to the new version - it's the opposite of
      // --squirrel-updated

      app.quit();
      return true;
  }
}

async function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    minWidth: 356,
    width: isDev ? 835 : 356,
    height: isDev ? 885 : 600,
    webPreferences: {
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
    icon: __dirname + "/icon.ico",
  });


  if (isDev) {
    mainWindow.webContents.toggleDevTools();

    //openReleaseNotes(mainWindow)

  }

  mainWindow.setAlwaysOnTop(true, "floating");

  Menu.setApplicationMenu(menu);

  //load the app page
  mainWindow.loadFile("renderer/index.html");

  // loads the videos when the app is loaded
  mainWindow.webContents.once("dom-ready", () => {
    if (isDev) {
      // send test video for debug
      mainWindow.webContents.send("video", {
        username: "elmarceloc",
        id: "Zvv_0cO-k7M",
        platform: "twitch",
      });
    }

    // send all time watched videos
    settings.get("videos.watched").then((videos) => {
      mainWindow.webContents.send("getAlltimeWatchedVideos", videos);
      //console.log("all time watched", videos);
    });
  });

  // opens external links in default browser
  mainWindow.webContents.on("new-window", function (e, url) {
    e.preventDefault();
    require("electron").shell.openExternal(url);
  });

  // saves a video by its id in the system
  ipcMain.on("storeVideo", function (e, videoId) {
    settings.get("videos.watched").then((videos) => {
      if (videos == null) videos = [];

      if (videos.includes(videoId)) return;

      const newWatchedVideos = [...(videos || []), videoId];

      console.log("new watched videos: ", newWatchedVideos);

      settings.set("videos", {
        watched: newWatchedVideos,
      });
    });
  });

  ipcMain.on("sendLink", function (e, username, message, platform) {
    links.youtube(username, message, platform);
    links.mercadolibre(username, message, platform);
    links.aliexpress(username, message, platform);
    links.amazon(username, message, platform);
    links.steam(username, message, platform);
  });

  mainWindow.once("ready-to-show", () => {
    console.log("checking updates...");
    autoUpdater.checkForUpdatesAndNotify();
  });

  // scrap booyah chat links

  booyah.scrapChatLinks();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});

autoUpdater.on("update-available", () => {
  console.log("update available");
  mainWindow.webContents.send("update_available");
});
autoUpdater.on("update-downloaded", () => {
  console.log("update downloaded");
  mainWindow.webContents.send("update_downloaded");
});

ipcMain.on("restart_app", () => {
  autoUpdater.quitAndInstall();
});
