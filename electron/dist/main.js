"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var fs = require("fs");
var path = require("path");
var url = require("url");
var win;
electron_1.app.commandLine.appendSwitch("js-flags", "--max-old-space-size=8192");
electron_1.app.on('ready', createWindow);
electron_1.app.on('activate', function () {
    if (win === null) {
        createWindow();
    }
});
electron_1.ipcMain.on('getFiles', function (event, arg) {
    var files = fs.readdirSync(__dirname);
    win.webContents.send('getFilesResponse', files);
});
function createWindow() {
    win = new electron_1.BrowserWindow({
        width: 1056, height: 830, webPreferences: {
            nodeIntegration: true
        }
    });
    win.loadURL(url.format({
        pathname: path.join(__dirname, "/../../dist/eigenfaces/index.html"),
        protocol: 'file:',
        slashes: true,
    }));
    win.setResizable(false);
    win.removeMenu();
    //win.webContents.openDevTools()
    win.on('closed', function () {
        win = null;
    });
}
//# sourceMappingURL=main.js.map