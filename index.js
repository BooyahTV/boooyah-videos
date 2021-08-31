// Modules to control application life and create native browser window
const { Menu, app, BrowserWindow, ipcMain } = require("electron");
const puppeteer = require("puppeteer-core");
const cheerio = require("cherio");
const settings = require("electron-settings");

const og = require("open-graph");

const PriceFinder = require("price-finder");
const priceFinder = new PriceFinder();
const streamID = "77452717"; // 70910636

const currencyRegex = /[$]\s+([^\s]+)/g;

const { autoUpdater } = require('electron-updater');

var mainWindow;

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
          id: "showWatchedInSession",
          type: "checkbox",
          label: "Mostrar links Vistos",
          checked: true,
          click: function (item, browser) {
            var state = item.checked;

            mainWindow.webContents.send("showWatchedInSession", {
              state: state,
            });
          },
        },
      ],
    },

    {
      label: "Youtube",
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
      ],
    },
    {
      label: "Productos",
      submenu: [
       /* {
          id: 'sortLess',
          label: 'Menor a mayor',
          type:'radio',
          click: (item) => {
            var state = item.enabled;
            mainWindow.webContents.send("sort", false);

          }
        },
        {
          id: 'sortHigher',
          label: 'Mayor a menor',
          type:'radio',
          click: (item) => {
            var state = item.enabled;
            mainWindow.webContents.send("sort", true);
          }
        },
        { type: 'separator'},*/
        {
          id: "mercadolibre",
          type: "checkbox",
          label: "Mercado Libre",
          checked: true,
          click: function (item, browser) {
            var state = item.checked;

            mainWindow.webContents.send("toggleStore", {store: 'mercadolibre', status: state});
          },
        },
        {
          id: "aliexpress",
          type: "checkbox",
          label: "Aliexpress",
          checked: true,
          click: function (item, browser) {
            var state = item.checked;

            mainWindow.webContents.send("toggleStore", {store: 'aliexpress', status: state});
          },
        },
        {
          id: "amazon",
          type: "checkbox",
          label: "Amazon",
          checked: true,
          click: function (item, browser) {
            var state = item.checked;

            mainWindow.webContents.send("toggleStore", {store: 'amazon', status: state});
          },
        },
        ,
        {
          id: "steam",
          type: "checkbox",
          label: "Steam",
          checked: true,
          click: function (item, browser) {
            var state = item.checked;

            mainWindow.webContents.send("toggleStore", {store: 'steam', status: state});
          },
        },
      ],
    },
    {
      label: "Configuración",
      submenu: [
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

  mainWindow.webContents.once("dom-ready", () => {
    // send test video for debug
   /* mainWindow.webContents.send("video", {
      username: "elmarceloc",
      id: "Zvv_0cO-k7M",
    });*/

    // send all time watched videos
    settings.get("videos.watched").then((videos) => {
      mainWindow.webContents.send("getAlltimeWatchedVideos", videos);
      console.log("all time watched", videos);
    });
  });

  mainWindow.webContents.on("new-window", function (e, url) {
    e.preventDefault();
    require("electron").shell.openExternal(url);
  });

  ipcMain.on("storeVideo", function (e, videoId) {
    settings.get("videos.watched").then((videos) => {
      if (videos == null) {
        videos = [];
      }

      if (videos.includes(videoId)) return;

      const newWatchedVideos = [...(videos || []), videoId];

      console.log("new watched videos: ", newWatchedVideos);

      settings.set("videos", {
        watched: newWatchedVideos,
      });
    });
  });

  ipcMain.on("sendLink", function (e, username, message, platform) {
    console.log('message sent from',platform)

    youtube(username, message, platform)
    mercadolibre(username, message, platform)
    aliexpress(username, message, platform)
    amazon(username, message, platform)
    steam(username, message, platform)

  });

  /* var executablePath = puppeteer
    .executablePath()
    .replace("app.asar", "app.asar.unpacked");*/

  var locateChrome = require("locate-chrome");

  const executablePath = await new Promise((resolve) =>
    locateChrome((arg) => resolve(arg))
  );

  const browser = await puppeteer.launch({
    args: [`--no-sandbox`],
    //headless: false,
    executablePath: executablePath,
  });
  const page = await browser.newPage();

  const chatroomURL = "https://booyah.live/" + streamID;

  console.log("Loading Chatroom Page..", chatroomURL);
  await page.goto(chatroomURL);

  console.log("Loading Chat..");

  // wait unitl the page loads .scollbar-container (chat)
  await page.waitForSelector(".scroll-container");
  console.log("Chat Loaded, waiting for messages..");

  await page.exposeFunction("onNewMessage", readMessage);

  await page.evaluate(() => {
    console.log("mutation observer inserted");
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



  mainWindow.once('ready-to-show', () => {
    autoUpdater.checkForUpdatesAndNotify();
  });

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

function readMessage(newMessage) {
  const $ = cheerio.load(newMessage);

  const username = $(".username").text();
  const message = $(".message-text").text();

  console.log(username + ": " + message);

  youtube(username, message, 'booyah')

  mercadolibre(username, message, 'booyah')

  aliexpress(username, message, 'booyah')

  amazon(username, message, 'booyah')

  steam(username, message, 'booyah')
}


function youtube(username, message, platform) {
  
  const prefix = /yt=([^\s]+)/g;
  const full =  /http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-\_]*)(&(amp;)?‌​[\w\?‌​=]*)?/g

  urlRegex([prefix, full], message, function(id, index){

    // if is the prefixed regex, cuts the prefix,
    // otherwise, cut the id part
    id = index == 0 ? id.substring(3) : id.slice(-11)
    console.log(id)
    mainWindow.webContents.send("video", {
      username: username,
      id: id,
      platform: platform
    });
  })
}

function mercadolibre(username, message,platform) {
  const prefix = /ml=(.)([^\s]+)/g
  const full = /(http|https):\/\/?(.)(?:www\.)?articulo.mercadolibre.cl(.)([^\s]+)/g;
  const baseUrl = 'https://articulo.mercadolibre.cl/'

  urlRegex([prefix, full], message, function(id, index){
    
    let url = ''

    if(index == 1){
      url = encodeURI(id);
    }else{
      url = encodeURI(baseUrl + id.slice(3));
    }    

    og(url, function (err, meta) {
      if(err) return

      let title = meta.title.split("$");
      title.splice(-1); // remove the price in the title

      title = title.join("").slice(0, -2);

      // formats the price
      let priceCLP = Number(
        meta.title
          .match(currencyRegex)[0]
          .replace("$", "")
          .replace(/\./g, "")
          .trim()
      );
      
      let img = meta["image"] !== undefined ? meta.image.url : null;

      sendProduct(username,url,title,priceCLP,null,null,img,"mercadolibre", "Mercado Libre",platform)
    })
  })

}

function aliexpress(username, message, platform) {
  const prefix = /ae=(.)([^\s]+)/g
  const full = /(?:https:\/\/)?(es|cl)\.aliexpress\.com\/(\S+)/g;
  const baseUrl = 'https://es.aliexpress.com/'

  urlRegex([prefix, full], message,function(id, index){

    let url = ''

    if(index == 1){
      url = encodeURI(id);
    }else{
      url = encodeURI(baseUrl + id.slice(3)+ ".html");
    }    
    console.log(index)
    og(url, function (err, meta) {
      if(err) return
      title = meta.title.split("|")[1];
      img = meta["image"] !== undefined ? meta.image.url : null;
      priceCLP = Number(meta.title.split("CLP")[0].trim());

      sendProduct(username,url,title,priceCLP,null,null,img,"aliexpress", "Aliexpress", platform)

    });
  })
}

function amazon(username, message,platform){
  const prefix =  /az=(.)([^\s]+)/g
  const full =  /(http|https):\/\/?(.)www.amazon.com(.)([^\s]+)/g;
  const baseUrl = 'https://www.amazon.com/'

  urlRegex([prefix, full], message, function(id, index){
    let url = ''

    if(index == 1){
      url = encodeURI(id.replace('-/es/','').split('/ref=')[0]);
    }else{
      url = encodeURI(baseUrl + id.slice(3));
    }    
    console.log(url)
    priceFinder.findItemDetails(url, function (err, item) {
      if(err) return
      console.log(item)

      sendProduct(username,url,item.name,null, item.price, item.category,null,"amazon", "Amazon", platform)

    });
  })    
}

function steam(username, message, platform) {
  const prefix = /ae=(.)([^\s]+)/g
  const full = /(?:https:\/\/)?store\.steampowered\.com\/(\S+)/g;
  const baseUrl = 'https://store.steampowered.com/'

  urlRegex([prefix, full], message,function(id, index){
    let url = ''

    if(index == 1){
      url = encodeURI(id);
    }else{
      url = encodeURI(baseUrl + id.slice(3)+ ".html");
    }    

    og(url, function (err, meta) {
      if(err) return
      img = meta["image"] !== undefined ? meta.image.url : null;

      priceFinder.findItemDetails(url, function(err, item) {
        if(err) return
        var price = item.price.toString().replace(/\./g,'')

        sendProduct(username,url,item.name,price,null,item.category,img,"steam", "Steam", platform)

      });


    });
  })
}


function urlRegex(regexs, message, callback){

  regexs.forEach((regex,index) => {
    if (message.match(regex) !== null) {
  
      message.match(regex).forEach((id) => {
        console.log("id: ", id);
        callback(id,index)
      });
    }
  })

  
}


function sendProduct(username, url, title, clp, usd, category,img, store, storeReadeable, platform) {
  let product = {
    username: username,
    url: url,
    title: title,
    priceCLP: clp,
    priceUSD: usd,
    category: category,
    img: img,
    watched: false,
    store: store,
    storeReadeable: storeReadeable,
    platform: platform
  }
  console.log(product)
  mainWindow.webContents.send("product",product );
}



autoUpdater.on('update-available', () => {
  mainWindow.webContents.send('update_available');
});
autoUpdater.on('update-downloaded', () => {
  mainWindow.webContents.send('update_downloaded');
});


ipcMain.on('restart_app', () => {
  autoUpdater.quitAndInstall();
});