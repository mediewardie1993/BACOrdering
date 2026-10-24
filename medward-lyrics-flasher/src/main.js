const { app, BrowserWindow, ipcMain, dialog, screen } = require('electron');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

let control = null;
let output = null;
let lastState = null;

function createControl() {
  control = new BrowserWindow({
    width: 1400,
    height: 860,
    title: 'Medward Lyrics Flasher',
    backgroundColor: '#14141a',
    webPreferences: { preload: path.join(__dirname, 'preload.js') },
  });
  control.setMenuBarVisibility(false);
  control.loadFile(path.join(__dirname, 'index.html'));
  control.on('closed', () => {
    control = null;
    if (output) output.close();
  });
}

function openOutput() {
  if (output) { output.focus(); return; }
  const displays = screen.getAllDisplays();
  const primary = screen.getPrimaryDisplay();
  const target = displays.find((d) => d.id !== primary.id) || primary;
  output = new BrowserWindow({
    x: target.bounds.x + 40,
    y: target.bounds.y + 40,
    width: 960,
    height: 540,
    title: 'Medward Lyrics Flasher - Output',
    backgroundColor: '#000000',
    autoHideMenuBar: true,
    webPreferences: { preload: path.join(__dirname, 'preload.js') },
  });
  output.loadFile(path.join(__dirname, 'output.html'));
  if (target.id !== primary.id) output.setFullScreen(true);
  output.on('closed', () => {
    output = null;
    if (control) control.webContents.send('output-closed');
  });
}

ipcMain.handle('pick-video', async () => {
  const r = await dialog.showOpenDialog(control, {
    title: 'Choose a background video',
    properties: ['openFile'],
    filters: [{ name: 'Video', extensions: ['mp4', 'webm', 'mov', 'm4v', 'mkv', 'ogv'] }],
  });
  if (r.canceled || !r.filePaths[0]) return null;
  return { url: pathToFileURL(r.filePaths[0]).href, name: path.basename(r.filePaths[0]) };
});

ipcMain.handle('pick-font', async () => {
  const r = await dialog.showOpenDialog(control, {
    title: 'Choose a font file',
    properties: ['openFile'],
    filters: [{ name: 'Fonts', extensions: ['ttf', 'otf', 'woff', 'woff2'] }],
  });
  if (r.canceled || !r.filePaths[0]) return null;
  const p = r.filePaths[0];
  return { url: pathToFileURL(p).href, name: path.basename(p, path.extname(p)) };
});

ipcMain.handle('save-song', async (_e, json) => {
  const r = await dialog.showSaveDialog(control, {
    title: 'Save song',
    defaultPath: 'song.lyrics.json',
    filters: [{ name: 'Song', extensions: ['json'] }],
  });
  if (r.canceled || !r.filePath) return false;
  fs.writeFileSync(r.filePath, json, 'utf8');
  return true;
});

ipcMain.handle('load-song', async () => {
  const r = await dialog.showOpenDialog(control, {
    title: 'Open song',
    properties: ['openFile'],
    filters: [{ name: 'Song', extensions: ['json'] }],
  });
  if (r.canceled || !r.filePaths[0]) return null;
  return fs.readFileSync(r.filePaths[0], 'utf8');
});

ipcMain.on('open-output', openOutput);
ipcMain.on('toggle-fullscreen', () => { if (output) output.setFullScreen(!output.isFullScreen()); });
ipcMain.on('state', (_e, state) => {
  lastState = state;
  if (output) output.webContents.send('state', state);
});
ipcMain.on('output-ready', () => { if (output && lastState) output.webContents.send('state', lastState); });

app.whenReady().then(createControl);
app.on('window-all-closed', () => app.quit());
