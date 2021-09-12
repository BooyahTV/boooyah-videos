const { Menu, BrowserWindow } = require("electron");

var stores = [
  { id: "mercadolibre", label: "Mercado Libre" },
  { id: "aliexpress", label: "Aliexpress" },
  { id: "amazon", label: "Amazon" },
  { id: "steam", label: "Steam" },
];

var tabs = [
    { id: "videos", label: "Videos" },
    { id: "watchlater", label: "Ver más tarde" },
    { id: "channels", label: "Canales" },
    { id: "products", label: "Tiendas" },
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

tabs.forEach(tab => {
    tabsItems.push({
        id: tab.id,
        type: "checkbox",
        label: tab.label,
        checked: true,
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
        id: "showWatchedInSession",
        type: "checkbox",
        label: "Mostrar links Vistos",
        checked: true,
        click: function (item, browser) {
          BrowserWindow.getAllWindows()[0].webContents.send(
            "showWatchedInSession",
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
    ],
  },
]);

module.exports = menu;
