import { app, BrowserWindow, ipcMain } from 'electron'
import * as fs from 'fs';
import * as path from 'path'
import * as url from 'url'

let win: BrowserWindow;
app.commandLine.appendSwitch("js-flags", "--max-old-space-size=8192");
app.on('ready', createWindow)

app.on('activate', () => {
    if (win === null) {
        createWindow()
    }
})

ipcMain.on('getFiles', (event, arg) => {
    const files = fs.readdirSync(__dirname)
    win.webContents.send('getFilesResponse', files)
})

function createWindow() {
    win = new BrowserWindow({
        width: 1056, height: 830, webPreferences: {
            nodeIntegration: true
        },
        title: "Eigenfaces TS/HTML5/Angular"
    });

    win.loadURL(
        url.format({
            pathname: path.join(__dirname, `/../../dist/eigenfaces/index.html`),
            protocol: 'file:',
            slashes: true,
        })
    );

    win.setResizable(false);
    win.webContents.once('did-finish-load', () => {
        win.setMenuBarVisibility(false);
    })

    win.on('page-title-updated', function (e) {
        e.preventDefault()
    });

    win.setTitle("Eigenfaces TS/HTML5/Angular")
    //win.webContents.openDevTools()

    win.on('closed', () => {
        win = null;
    })
}