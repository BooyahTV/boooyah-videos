// Modules to control application life and create native browser window
const { Menu, app, BrowserWindow, ipcMain, globalShortcut, dialog } = require("electron");
const AutoLaunch = require('auto-launch');

const pjson = require('../package.json');

const windowStateKeeper = require('electron-window-state');


const http = require('http');
const fs = require('fs');

const path = require('path');

const settings = require("electron-settings");

const { autoUpdater } = require("electron-updater");

const isDev = require("electron-is-dev");

const menu = require("./menu");
const links = require("./links");

var mainWindow;

const testVideos = ['WCi2DLYE82A', 'Zvv_0cO-k7M']

const server = require("./server");

const { getAudioUrl } = require('uberduck-api');

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

var mainWindow;

async function createWindow() {

  // Load the previous state with fallback to defaults
  let mainWindowState = windowStateKeeper({
    defaultWidth: isDev ? 835 : 356,
    defaultHeight: isDev ? 885 : 600
  });

  // Create the browser window.
  mainWindow = new BrowserWindow({
    minWidth: 356,
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: mainWindowState.width,
    height: mainWindowState.height,
    webPreferences: {
     nodeIntegration: true,
      nodeIntegrationInWorker: true,
      enableRemoteModule: true,
      contextIsolation: false,
      nativeWindowOpen: true
    },
    icon: __dirname + "/icon.ico",
  });

  mainWindowState.manage(mainWindow);

  // https://www.npmjs.com/package/@electron/remote
  require('@electron/remote/main').initialize()
  require("@electron/remote/main").enable(mainWindow.webContents) 


  if (isDev) mainWindow.webContents.toggleDevTools();

  if (!isDev) mainWindow.setAlwaysOnTop(true, "floating");
  

  Menu.setApplicationMenu(menu);


  //load the app page
  mainWindow.loadURL('http://localhost:8080');

 // mainWindow.loadFile("renderer/index.html");

  // loads the videos when the app is loaded
  mainWindow.webContents.once("dom-ready", () => {
    if (isDev) {
      // send test video for debug
      testVideos.forEach(function(video) {
        mainWindow.webContents.send("video", {
          username: "elmarceloc",
          id: video,
          platform: "twitch",
        })
      })
    }

    // send dev mode
    mainWindow.webContents.send("isDev", isDev)

    // send all time watched videos
    settings.get("videos.watched").then((videos) => {
      mainWindow.webContents.send("getAlltimeWatchedVideos", videos);
    });

    // send watchlater videos
    settings.get("videos.watchlater").then((videos) => {
      mainWindow.webContents.send("getWatchlaterVideos", videos);
    });

    // send all channels
    settings.get("channels.bookmark").then((channels) => {
      mainWindow.webContents.send("getAllChannels", channels);
    });

    settings.get("twitch.name").then((twitchChannel) => {
      mainWindow.webContents.send("twitchChannel", twitchChannel || 'cristianghost');
    });

    // volume
    settings.get("songrequest.volume").then((volume) => {
      mainWindow.webContents.send("getVolume", volume || 100); // default volume of 100
    });

    // polls
    settings.get("polls.slots").then((polls) => {
      mainWindow.webContents.send("setPolls", polls  || []); // default volume of 100
    });

    settings.get("backgrounds.backgrounds").then((backgrounds) => {
      mainWindow.webContents.send("backgrounds", backgrounds || []);
    });


  });

  // opens external links in default browser
  mainWindow.webContents.on("new-window", function (e, url) {
    e.preventDefault();
    require("electron").shell.openExternal(url);
  });

  // saves volumen
  
  ipcMain.on("saveVolume", function (e, volume) {
    settings.set("songrequest", {
      volume: volume,
    });
  })

  // save background


  ipcMain.on("saveBackground", function (e, background) {

    settings.get("backgrounds.backgrounds").then((backgrounds) => {
      if (backgrounds == null) backgrounds = [];

      if (backgrounds.includes(background)) return;

      const newBackgrounds = [...backgrounds, background];

      console.log("new backgrounds: ", newBackgrounds);

      settings.set("backgrounds", {
        backgrounds: newBackgrounds,
      });
      
    });

  })

  

  ipcMain.on("removeBackground", function (e, targetBackground) {
    settings.get("backgrounds.backgrounds").then((backgrounds) => {
      
      if (backgrounds == null) backgrounds = [];
            
      newBackgrounds = backgrounds.filter(function(background) {
          return background !== targetBackground
      })

      console.log("backgrounds: ", backgrounds.length);

      settings.set("backgrounds", {
        backgrounds: newBackgrounds,
      });
    });
  });

  // saves a video by its id in the system
  ipcMain.on("storeVideo", function (e, videoId) {
    settings.get("videos.watched").then((videos) => {
      if (videos == null) videos = [];

      if (videos.includes(videoId)) return;

      const newWatchedVideos = [...(videos || []), videoId];

      console.log("new watched videos: ", newWatchedVideos.length);

      console.log(newWatchedVideos)

      settings.set("videos", {
        watched: newWatchedVideos,
      });

      // remove the video from watchlater list
            
      videos = videos.filter(function(video) {
          return video.id !== videoId
      })

      console.log("new videos with removed video: ", videos.length);

      settings.set("videos", {
        watchlater: videos,
      });
      
    });
  });

  // saves a watch later video
  ipcMain.on("addWatchLaterVideo", function (e, newVideo) {
    settings.get("videos.watchlater").then((videos) => {
      console.log("Try to add video to watchlater");

      if (videos == null) videos = [];

      var hasVideo = false

      videos.forEach(video => {
        if(video.id == newVideo.id) hasVideo = true
      })

      if (hasVideo) return;

      const newWatchLaterVideos = [...(videos || []), newVideo];

      console.log("new Watch Later Videos videos: ", newWatchLaterVideos.length);

      settings.set("videos", {
        watchlater: newWatchLaterVideos,
      });
    });
  });
  

  // saves a channel
  ipcMain.on("storeChannel", function (e, newChannel) {
    settings.get("channels.bookmark").then((channels) => {
      
      if (channels == null) channels = [];

      console.log('current channels',channels.length)

      var hasChannel = false

      channels.forEach(channel => {
        if(channel.id == newChannel.id) hasChannel = true
      })

      if (hasChannel) return;

      const newChannels = [...(channels || []), newChannel];

      console.log("new channels: ", newChannels);

      settings.set("channels", {
        bookmark: newChannels,
      });
    });
  });

  // delete a channel
  ipcMain.on("deleteChannel", function (e, id) {
    settings.get("channels.bookmark").then((channels) => {
      
      if (channels == null) channels = [];
      
      console.log('current channels',channels.length,id)
      
      channels = channels.filter(function(channel) {
          return channel.id !== id
      })

      console.log("new channels with removed channel: ", channels.length);

      settings.set("channels", {
        bookmark: channels,
      });
    });
  });


  

  ipcMain.on("sendLink", function (e, username, message, platform) {      
    links.youtube(username, message, platform);
    links.youtubeMusicVideo(username, message, platform);
    links.mercadolibre(username, message, platform);
    links.aliexpress(username, message, platform);
    links.amazon(username, message, platform);
    links.steam(username, message, platform);
    links.clips(username, message, platform);
  });


  // slots


  ipcMain.on("saveSlot", function (e, poll) {      
    settings.get("polls.slots").then((polls) => {

      // if the poll list is null, make it an empty array
      if (polls == null) polls = [];

      // removes the poll if it is in the saved polls
      polls.forEach((testPoll, index, object) => {
        if (poll.slot == testPoll.slot) {
          object.splice(index, 1);
        }
      });

      // adds the poll to the saved polls
      const newPolls = [...(polls || []), poll];

      console.log('polls', newPolls)

      // save in settings
      settings.set("polls", {
        slots: newPolls,
      });
    });
    
  });

  var list = ['fernanfloo', 'homero']

  ipcMain.on('uberduck', function (event, question) {
    var randomValue = list[Math.floor(list.length * Math.random())];

      getAudioUrl(
        'pub_inqajoxwegyxvysxkx', 
        'pk_a45d0106-f7e0-47dc-bc7b-fc6b9fe49f20', 
        randomValue, 
        question.label)
        .then((url) => {
            console.log('uberduck', url)

            mainWindow.webContents.send('uberduck', {
              uberduck: true,
              url: url,
              label: question.label,
              author: question.author,
              tags: question.tags
            })

        })
    
  })


  ipcMain.on("removeSlot", function (e, slot) {    
    settings.get("polls.slots").then((polls) => {

      // if the poll list is null, make it an empty array
      if (polls == null) polls = [];

      // removes the poll if it is in the saved polls
      polls.forEach((testPoll, index, object) => {
        if (slot == testPoll.slot) {
          object.splice(index, 1);
        }
      });

      // save in settings
      console.log('polls', polls)

      settings.set("polls", {
        slots: polls,
      });
    });
  });


  
  






  mainWindow.once("ready-to-show", () => {
    console.log("checking updates...");
    autoUpdater.checkForUpdatesAndNotify();
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  let autoLaunch = new AutoLaunch({
    name: 'BooyahVideos',
    path: app.getPath('exe'),
  });

  autoLaunch.isEnabled().then((isEnabled) => {
    if (isEnabled) autoLaunch.disable();
  });

  globalShortcut.register('Alt+CommandOrControl+I', () => {
    mainWindow.webContents.send('toggleSongRequest')
  })

  globalShortcut.register('Alt+CommandOrControl+o', () => {
    mainWindow.webContents.send('togglePauseSongRequest')
  })

  globalShortcut.register('Alt+CommandOrControl+p', () => {
    mainWindow.webContents.send('skipSongRequest')
  })

  globalShortcut.register('Alt+CommandOrControl+k', () => {
    mainWindow.webContents.send('startBasicPoll')
  })

  globalShortcut.register('Alt+CommandOrControl+l', () => {
    mainWindow.webContents.send('changeStatePoll')
  })

  globalShortcut.register('Alt+CommandOrControl+n', () => {
    mainWindow.webContents.send('nextQuestion')
  })

  globalShortcut.register('Alt+CommandOrControl+m', () => {
    mainWindow.webContents.send('showQuestion')
  })
  
  globalShortcut.register('Alt+CommandOrControl+j', () => {
    mainWindow.webContents.send('addVolume')
  })

  globalShortcut.register('Alt+CommandOrControl+h', () => {
    mainWindow.webContents.send('reduceVolume')
  })

  globalShortcut.register('Alt+CommandOrControl+h', () => {
    mainWindow.webContents.send('reduceVolume')
  })

  // poll slots (0 - 9)
  for (let i = 0; i <= 9; i++) {

    globalShortcut.register('Alt+CommandOrControl+'+i, () => {
      console.log('Poll slot #'+i)
      
      mainWindow.webContents.send('pollSlot', i)

    })

  }

  // backgrounds (0 - 0)
  for (let i = 0; i <= 9; i++) {

    globalShortcut.register('Alt+'+i, () => {
      
      mainWindow.webContents.send('setBackground', i)

    })

  }
 
  /*mainWindow.on('close', (event) => {
    event.preventDefault(); 
    dialog.showMessageBox(mainWindow,{
        message: "Estas seguro que deseas cerrar el programa?",
        type: "warning",
        buttons: ["Cerrar" ,"Cancel"],
        defaultId: 0,
        title: "Confirmar cierre",
        detail: "Se perderán los videos enviados durante la sesión"
    }
    ).then((res) => {
        console.log(res);
        if(res.response === 0){
            mainWindow.destroy();
        }
    });
  });*/


  

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
