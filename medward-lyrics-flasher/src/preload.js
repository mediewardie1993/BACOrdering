const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  pickVideo: () => ipcRenderer.invoke('pick-video'),
  pickFont: () => ipcRenderer.invoke('pick-font'),
  saveSong: (json) => ipcRenderer.invoke('save-song', json),
  loadSong: () => ipcRenderer.invoke('load-song'),
  openOutput: () => ipcRenderer.send('open-output'),
  toggleFullscreen: () => ipcRenderer.send('toggle-fullscreen'),
  sendState: (s) => ipcRenderer.send('state', s),
  outputReady: () => ipcRenderer.send('output-ready'),
  onState: (cb) => ipcRenderer.on('state', (_e, s) => cb(s)),
  onOutputClosed: (cb) => ipcRenderer.on('output-closed', () => cb()),
});
