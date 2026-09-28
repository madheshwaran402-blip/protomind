const { contextBridge, ipcRenderer } = require("electron")

contextBridge.exposeInMainWorld("electronAPI", {
  checkSetup: function() { return ipcRenderer.invoke("check-setup") },
  runSetup: function() { return ipcRenderer.invoke("run-setup") },
  startOllama: function() { return ipcRenderer.invoke("start-ollama") },
  ollamaStatus: function() { return ipcRenderer.invoke("ollama-status") },
  openExternal: function(url) { return ipcRenderer.invoke("open-external", url) },
  onSetupProgress: function(callback) {
    ipcRenderer.on("setup-progress", function(event, data) { callback(data) })
    return function() { ipcRenderer.removeAllListeners("setup-progress") }
  },
  setupComplete: function() { ipcRenderer.send("setup-complete") },
  isElectron: true,
})
