// Modules to control application life and create native browser window
const { app, BrowserWindow, shell, ipcMain } = require('electron')
const path = require('path')
const { setupTitlebar, attachTitlebarToWindow } = require("custom-electron-titlebar/main");


let mainWindow;

function createWindow() {
  setupTitlebar();
  mainWindow = new BrowserWindow({
    width: 1700,
    height: 875,
    icon: path.join(__dirname, "assets/images/logoAlter.png"),
    titleBarStyle: 'hidden',
    webPreferences: {

      preload: path.join(__dirname, 'front/preload.js'),
      nodeIntegration: true,
      contextIsolation: false,

    }
  });
  // and load the index.html of the app.
  mainWindow.loadFile('front/index.html')
  mainWindow.webContents.on('will-navigate', (event, url) => {
    event.preventDefault();
    shell.openExternal(url);
  });

  attachTitlebarToWindow(mainWindow);
  mainWindow.setMenu(null)


  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  const args = process.argv.slice(2);
  const isDevMode = args.includes('--dev');

  if (isDevMode) {
    mainWindow.webContents.openDevTools();
    mainWindow.webContents.once('did-finish-load', () => {
      mainWindow.webContents.send('dev-mode', 'Dev mode enabled');
    });
  }

}




// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

ipcMain.on('resize-window', (event, height) => {
  let [width] = mainWindow.getSize();
  mainWindow.setSize(width, height);
});