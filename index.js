// Modules to control application life and create native browser window
const { Menu, app, BrowserWindow,ipcMain } = require("electron");
const puppeteer = require("puppeteer");
const cheerio = require("cherio");
const settings = require('electron-settings');


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
  const mainWindow = new BrowserWindow({
    minWidth: 356,
    width: 356,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
    icon: __dirname + "/icon.ico",
  });

  //mainWindow.webContents.toggleDevTools();

  // Build the application menu
  var menu = Menu.buildFromTemplate([
    {
      label: "Ver",
      submenu: [
        {
          id: "shortvideos",
          type: "checkbox",
          label: "Mostrar videos cortos",
          checked: true,
          click: function (item, browser) {
            var state = item.checked;

            mainWindow.webContents.send("shortvideos", {
              state: state,
            });
          },
        },
        {
          id: "showWatchedInSession",
          type: "checkbox",
          label: "Mostrar Videos Vistos",
          checked: true,
          click: function (item, browser) {
            var state = item.checked;

            mainWindow.webContents.send("showWatchedInSession", {
              state: state,
            });
          },
        },
        {type:'separator'},
        {
          label: "Ventana Flotante",
          type: "checkbox",
          checked: true,
          click: function (item, browser) {
            var state = item.checked;
            if (state) {
              mainWindow.setAlwaysOnTop(true, "floating");
            } else {
              mainWindow.setAlwaysOnTop(false);
            }
          },
        },
      ],
    },
  ]);

  mainWindow.setAlwaysOnTop(true, "floating");

  Menu.setApplicationMenu(menu);

  //load the app page
  mainWindow.loadFile("index.html");

   mainWindow.webContents.once('dom-ready', () => {
    // send test video for debug
   /* mainWindow.webContents.send('message', {
      username: 'elmarceloc',
      id: 'Zvv_0cO-k7M'
    });*/

    // send all time watched videos
    settings.get('videos.watched').then(videos => {
      mainWindow.webContents.send('getAlltimeWatchedVideos', videos);
      console.log('all time watched',videos)
    })

  });

  mainWindow.webContents.on("new-window", function (e, url) {
    e.preventDefault();
    require("electron").shell.openExternal(url);
  });

  ipcMain.on("storeVideo", function (e, videoId) {

    settings.get('videos.watched').then(videos => {

      if(videos.includes(videoId)) return

      const newWatchedVideos = [...(videos || []), videoId];
      
      console.log('new watched videos: ',newWatchedVideos)

      settings.set('videos', {
        watched: newWatchedVideos
      });

    })


  });

  var executablePath = puppeteer
    .executablePath()
    .replace("app.asar", "app.asar.unpacked");

  const browser = await puppeteer.launch({
    args: [`--no-sandbox`],
    executablePath: executablePath,
  });
  const page = await browser.newPage();

  console.log("Loading Page..");

  await page.goto("https://booyah.live/standalone/chatroom/79543340");
  console.log("Loading Chat..");

  // Wait for the required DOM to be rendered
  await page.waitForSelector(".scroll-container");
  console.log("Chat Loaded, waiting for messages..");

  // Get the link to all the required books
  await page.exposeFunction("onNewMessage", (newMessage) => {
    const $ = cheerio.load(newMessage);

    const username = $(".username").text();
    const message = $(".message-text").text();

    let youtubePrefixRegex = /yt=(.){11}/g;

    if (message.match(youtubePrefixRegex) !== null) {
      message.match(youtubePrefixRegex).forEach((youtubeID) => {
        console.log(username, message);

        mainWindow.webContents.send("message", {
          username: username,
          id: youtubeID.substring(3),
        });
      });
    }
  });

  await page.evaluate(() => {
    const target = document.querySelector(".scroll-container");
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "childList") {
          onNewMessage(mutation.addedNodes.item(0).innerHTML);
        }
      }
    });
    observer.observe(target, { childList: true });
  });

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
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