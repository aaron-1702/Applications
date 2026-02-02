const { app, BrowserWindow, ipcMain } = require("electron");

function createWindow() {
  const win = new BrowserWindow({
    title: "Modern Tasks",
    width: 450,
    height: 650,
    minWidth: 350,
    minHeight: 500,
    resizable: true,
    frame: false,
    transparent: true,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true
    }
  });

  win.loadFile("index.html");
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

ipcMain.on('close-app', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  win.close();
});