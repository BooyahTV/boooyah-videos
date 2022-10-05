const { Menu, BrowserWindow } = require("electron");
const prompt = require('electron-prompt');
const settings = require("electron-settings");
const { clipboard } = require('electron')
const isDev = require("electron-is-dev");
const request = require('request');

var stores = [
  { id: "mercadolibre", label: "Mercado Libre" },
  { id: "aliexpress", label: "Aliexpress" },
  { id: "amazon", label: "Amazon" },
  { id: "steam", label: "Steam" },
];

var tabs = [
    { id: "videos", label: "Videos",checked: true },
    { id: "watchlater", label: "Ver más tarde",checked: true },
    { id: "songrequest", label: "Song Request",checked: true },
    { id: "poll", label: "Encuestas,checked: true" },
    { id: "questions", label: "Preguntas",checked: true },
    { id: "clips", label: "Clips",checked: false },
    { id: "channels", label: "Canales",checked: false },
    { id: "products", label: "Tiendas",checked: true },
    { id: "backgrounds", label: "Fondos",checked: true },
];

var videodata = [
    { id: "views", label: "VIsitas", enabled:true },
    { id: "durationFormated", label: "Duracion", enabled:true },
    { id: "publishedAt", label: "Fecha", enabled:true },
    { id: "channel", label: "Canal", enabled:true },
    { id: "author", label: "Usuario", enabled:true },
    { id: "category", label: "Categoria", enabled:true },
    { id: "likeratio", label: "Likes", enabled:true },
    { id: "description", label: "Descripción", enabled:false },
];

// populates store items

var storeItems = []
var tabsItems = []
var videodataItems = []

stores.forEach(store => {
    storeItems.push({
        id: store.id,
        type: "checkbox",
        label: store.label,
        checked: true,
        click: function (item, browser) {
            BrowserWindow.getAllWindows()[0].webContents.send("toggleStore", {
              store: store.id,
              status: item.checked,
            });
        },
    });
})

// populates tab items

tabs.forEach((tab,index) => {
    tabsItems.push({
        id: tab.id,
        type: "checkbox",
        label: tab.label,
        checked: tab.checked,
        click: function (item, browser) {
            BrowserWindow.getAllWindows()[0].webContents.send("toggleTab", {
                id: tab.id,
                status: item.checked,
            });
        },
    });
})


// populates video date

videodata.forEach(data => {
    videodataItems.push({
        id: data.id,
        type: "checkbox",
        label: data.label,
        checked: data.enabled,
        click: function (item, browser) {
            BrowserWindow.getAllWindows()[0].webContents.send("filtervideos", {
                type: data.id,
                state: item.checked,
            });
        },
    });
})

var menu = Menu.buildFromTemplate([
  {
    label: "Ver",
    submenu: [
      {
        id: "showSentInSession",
        type: "checkbox",
        label: "Mostrar links Vistos",
        checked: true,
        click: function (item, browser) {
          BrowserWindow.getAllWindows()[0].webContents.send(
            "showSentInSession",
            {
              state: item.checked,
            }
          );
        },
      },
      { type: "separator" },
      {
        label: "Youtube",
        submenu: [
          {
            id: "shortvideos",
            type: "checkbox",
            label: "Mostrar videos cortos",
            checked: true,
            click: function (item, browser) {
              BrowserWindow.getAllWindows()[0].webContents.send("filtervideos", {
                type:'shortvideos',
                state: item.checked,
              });
            },
          },
          {
            id: "musicalvideos",
            type: "checkbox",
            label: "Mostrar videos musicales",
            checked: true,
            click: function (item, browser) {
              BrowserWindow.getAllWindows()[0].webContents.send("filtervideos", {
                type:'musicalvideos',
                state: item.checked,
              });
            },
          },
          {
            label: "Datos",
            submenu: [...videodataItems]
          },

        ],
      },
      {
        label: "Tiendas",
        submenu: [...storeItems]
      }
    ],
  },
  {
    label: "Menú",
    submenu: [...tabsItems]

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
            BrowserWindow.getAllWindows()[0].setAlwaysOnTop(true, "floating");
          } else {
            BrowserWindow.getAllWindows()[0].setAlwaysOnTop(false);
          }
        },
      },
      {
        label: "Canal de Twitch.tv",
        click: function (item, browser) {
          settings.get("twitch.name").then((channelName) => {

            prompt({
              title: 'Canal de Twitch',
              label: 'Canal de Twitch:',
              value: channelName || 'cristianghost',
              type: 'input',
              alwaysOnTop: true,
            })
            .then((newChannelName) => {
                if(newChannelName === null) {
                    
                } else {
                  settings.set("twitch", {
                    name: newChannelName,
                  });
                }
            })
            .catch(console.error);
          });
        },
      }
    ],
  }, 
  {
    label: "Stream Deck",
    click: function(item, browser) {
      require('electron').shell.openExternal("https://gossamer-pigeon-70a.notion.site/Booyah-videos-integracion-con-streamdeck-00319aa70d7a43cbbffa34165e0b4da2");
    }
  }, 
  {
    label: "Overlays",
    submenu: [
      {
        label: "Encuestas",
        click: function (item, browser) {
          clipboard.writeText('http://localhost:8080/overlay', 'clipboard')
        },
      },
      {
        label: "Preguntas",
        click: function (item, browser) {
          clipboard.writeText('http://localhost:8080/overlayquestions', 'clipboard')
        },
      },
      {
        label: "Song request",
        click: function (item, browser) {
          clipboard.writeText('http://localhost:8080/overlaysongrequest', 'clipboard')
        },
      },
      {
        label: "Fondos",
        click: function (item, browser) {
          clipboard.writeText('http://localhost:8080/overlaybackground', 'clipboard')
        },
      }
    ],
  }
]);

module.exports = menu;