const electron = require('electron')

const BrowserWindow = electron.BrowserWindow

function openReleaseNotes(parent) {
    window = new BrowserWindow({
        width: 340,
        height: 360,
        parent: parent,
        center: true,
       // resizable: false,
       // movable: true,
        alwaysOnTop: true,
        fullscreenable: false,
        webPreferences: {
            enableRemoteModule: true,
            nodeIntegration: true,
            contextIsolation: false,
        },
        icon: __dirname + "/icon.ico",
        /* frame :false*/
    });
    window.show();
    window.loadFile('renderer/release_notes.html')
    
    window.setAlwaysOnTop(true);

}


module.exports = { openReleaseNotes };