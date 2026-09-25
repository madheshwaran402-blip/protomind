const { app, BrowserWindow, ipcMain, dialog, shell } = require("electron")
const { spawn, exec } = require("child_process")
const path = require("path")
const fs = require("fs")
const https = require("https")
const os = require("os")

// ── Globals ───────────────────────────────────────────────────────────────────
let mainWindow = null
let ollamaProcess = null
let ollamaReady = false

// ── Ollama paths per OS ───────────────────────────────────────────────────────
function getOllamaPath() {
  const platform = process.platform
  if (platform === "win32") return "C:\\Program Files\\Ollama\\ollama.exe"
  if (platform === "darwin") return "/usr/local/bin/ollama"
  return "/usr/local/bin/ollama"
}

function getOllamaInstallerUrl() {
  const platform = process.platform
  const arch = process.arch
  if (platform === "win32") return "https://ollama.ai/download/OllamaSetup.exe"
  if (platform === "darwin") {
    if (arch === "arm64") return "https://ollama.ai/download/Ollama-darwin-arm64.zip"
    return "https://ollama.ai/download/Ollama-darwin-amd64.zip"
  }
  return null // Linux uses install script
}

// ── Check if Ollama is installed ──────────────────────────────────────────────
function isOllamaInstalled() {
  return new Promise(function(resolve) {
    exec("ollama --version", function(error) {
      resolve(!error)
    })
  })
}

// ── Check if llama3.2 model is downloaded ─────────────────────────────────────
function isModelDownloaded() {
  return new Promise(function(resolve) {
    exec("ollama list", function(error, stdout) {
      if (error) { resolve(false); return }
      resolve(stdout.includes("llama3.2"))
    })
  })
}

// ── Download file with progress ───────────────────────────────────────────────
function downloadFile(url, dest, onProgress) {
  return new Promise(function(resolve, reject) {
    const file = fs.createWriteStream(dest)
    https.get(url, function(response) {
      // Handle redirects
      if (response.statusCode === 302 || response.statusCode === 301) {
        downloadFile(response.headers.location, dest, onProgress).then(resolve).catch(reject)
        return
      }
      const total = parseInt(response.headers["content-length"], 10)
      let downloaded = 0
      response.on("data", function(chunk) {
        downloaded += chunk.length
        if (onProgress) onProgress(downloaded, total)
      })
      response.pipe(file)
      file.on("finish", function() { file.close(); resolve() })
    }).on("error", function(err) {
      fs.unlink(dest, function() {})
      reject(err)
    })
  })
}

// ── Install Ollama ────────────────────────────────────────────────────────────
async function installOllama(sendStatus) {
  const platform = process.platform
  sendStatus({ step: "downloading", message: "Downloading Ollama AI engine...", progress: 0 })

  if (platform === "linux") {
    // Linux: use install script
    return new Promise(function(resolve, reject) {
      sendStatus({ step: "installing", message: "Installing Ollama on Linux..." })
      exec("curl -fsSL https://ollama.ai/install.sh | sh", function(error, stdout, stderr) {
        if (error) { reject(error); return }
        sendStatus({ step: "done", message: "Ollama installed!" })
        resolve()
      })
    })
  }

  const url = getOllamaInstallerUrl()
  const ext = platform === "win32" ? ".exe" : ".zip"
  const dest = path.join(os.tmpdir(), "ollama-installer" + ext)

  await downloadFile(url, dest, function(downloaded, total) {
    const pct = total ? Math.round(downloaded / total * 100) : 0
    sendStatus({ step: "downloading", message: "Downloading Ollama... " + pct + "%", progress: pct })
  })

  sendStatus({ step: "installing", message: "Installing Ollama..." })

  return new Promise(function(resolve, reject) {
    if (platform === "win32") {
      // Run Windows installer silently
      exec('"' + dest + '" /S', function(error) {
        if (error) { reject(error); return }
        sendStatus({ step: "done", message: "Ollama installed!" })
        resolve()
      })
    } else if (platform === "darwin") {
      // Mac: unzip and move to Applications
      exec("unzip -o " + dest + " -d /Applications/ && xattr -d com.apple.quarantine /Applications/Ollama.app 2>/dev/null || true", function(error) {
        if (error) { reject(error); return }
        // Create symlink for CLI
        exec("ln -sf /Applications/Ollama.app/Contents/Resources/ollama /usr/local/bin/ollama", function() {
          sendStatus({ step: "done", message: "Ollama installed!" })
          resolve()
        })
      })
    }
  })
}

// ── Download llama3.2 model ────────────────────────────────────────────────────
function downloadModel(sendStatus) {
  return new Promise(function(resolve, reject) {
    sendStatus({ step: "model", message: "Downloading llama3.2 AI model (~2GB)... This takes a few minutes.", progress: 0 })

    const proc = spawn("ollama", ["pull", "llama3.2"])

    proc.stdout.on("data", function(data) {
      const text = data.toString()
      // Parse ollama pull progress output
      const match = text.match(/(\d+)%/)
      if (match) {
        sendStatus({ step: "model", message: "Downloading llama3.2... " + match[1] + "%", progress: parseInt(match[1]) })
      }
    })

    proc.stderr.on("data", function(data) {
      const text = data.toString()
      const match = text.match(/(\d+)%/)
      if (match) {
        sendStatus({ step: "model", message: "Downloading llama3.2... " + match[1] + "%", progress: parseInt(match[1]) })
      }
    })

    proc.on("close", function(code) {
      if (code === 0) {
        sendStatus({ step: "model_done", message: "AI model ready!" })
        resolve()
      } else {
        reject(new Error("Model download failed with code " + code))
      }
    })
  })
}

// ── Start Ollama server ────────────────────────────────────────────────────────
function startOllama() {
  return new Promise(function(resolve, reject) {
    if (ollamaProcess) { resolve(); return }

    // Check if already running
    const http = require("http")
    const req = http.get("http://localhost:11434/api/tags", function(res) {
      if (res.statusCode === 200) {
        ollamaReady = true
        resolve()
        return
      }
      startFreshOllama(resolve, reject)
    })
    req.on("error", function() {
      startFreshOllama(resolve, reject)
    })
    req.setTimeout(2000, function() {
      req.destroy()
      startFreshOllama(resolve, reject)
    })
  })
}

function startFreshOllama(resolve, reject) {
  ollamaProcess = spawn("ollama", ["serve"], {
    detached: false,
    stdio: "ignore",
    env: Object.assign({}, process.env, { OLLAMA_HOST: "127.0.0.1:11434" })
  })

  ollamaProcess.on("error", function(err) {
    reject(err)
  })

  // Wait for Ollama to be ready (poll every 500ms, max 30s)
  let attempts = 0
  const check = setInterval(function() {
    attempts++
    const http = require("http")
    const req = http.get("http://localhost:11434/api/tags", function(res) {
      if (res.statusCode === 200) {
        clearInterval(check)
        ollamaReady = true
        resolve()
      }
    })
    req.on("error", function() {})
    req.setTimeout(500, function() { req.destroy() })

    if (attempts > 60) {
      clearInterval(check)
      reject(new Error("Ollama did not start in time"))
    }
  }, 500)
}

// ── Stop Ollama ────────────────────────────────────────────────────────────────
function stopOllama() {
  if (ollamaProcess) {
    ollamaProcess.kill("SIGTERM")
    ollamaProcess = null
    ollamaReady = false
  }
}

// ── Create main window ────────────────────────────────────────────────────────
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
    titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "default",
    icon: path.join(__dirname, "../public/icon.png"),
    show: false, // Show after setup
    backgroundColor: "#050510",
  })

  // Load the app
  const isDev = process.env.NODE_ENV === "development"
  if (isDev) {
    mainWindow.loadURL("http://localhost:5173")
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"))
  }

  mainWindow.once("ready-to-show", function() {
    mainWindow.show()
  })

  mainWindow.on("closed", function() {
    mainWindow = null
  })
}

// ── Setup wizard (first run) ──────────────────────────────────────────────────
function createSetupWindow() {
  const win = new BrowserWindow({
    width: 600,
    height: 500,
    resizable: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
    titleBarStyle: "hidden",
    backgroundColor: "#050510",
    show: false,
  })

  const isDev = process.env.NODE_ENV === "development"
  if (isDev) {
    win.loadURL("http://localhost:5173/setup")
  } else {
    win.loadFile(path.join(__dirname, "../dist/index.html"))
    win.webContents.executeJavaScript("window.location.hash = '/setup'")
  }

  win.once("ready-to-show", function() { win.show() })
  return win
}

// ── IPC handlers ──────────────────────────────────────────────────────────────
ipcMain.handle("check-setup", async function() {
  const ollamaInstalled = await isOllamaInstalled()
  const modelDownloaded = ollamaInstalled ? await isModelDownloaded() : false
  return { ollamaInstalled, modelDownloaded }
})

ipcMain.handle("run-setup", async function(event) {
  const win = BrowserWindow.getFocusedWindow()

  function sendStatus(status) {
    if (win && !win.isDestroyed()) {
      win.webContents.send("setup-progress", status)
    }
  }

  try {
    const ollamaInstalled = await isOllamaInstalled()
    if (!ollamaInstalled) {
      await installOllama(sendStatus)
    }
    // Start Ollama temporarily to download model
    await startOllama()
    const modelDownloaded = await isModelDownloaded()
    if (!modelDownloaded) {
      await downloadModel(sendStatus)
    }
    sendStatus({ step: "complete", message: "ProtoMind is ready!" })
    return { success: true }
  } catch(e) {
    sendStatus({ step: "error", message: "Error: " + e.message })
    return { success: false, error: e.message }
  }
})

ipcMain.handle("start-ollama", async function() {
  try {
    await startOllama()
    return { success: true }
  } catch(e) {
    return { success: false, error: e.message }
  }
})

ipcMain.handle("ollama-status", function() {
  return { ready: ollamaReady }
})

ipcMain.handle("open-external", function(event, url) {
  shell.openExternal(url)
})

// ── App lifecycle ─────────────────────────────────────────────────────────────
app.whenReady().then(async function() {
  const ollamaInstalled = await isOllamaInstalled()
  const modelDownloaded = ollamaInstalled ? await isModelDownloaded() : false

  if (!ollamaInstalled || !modelDownloaded) {
    // Show setup window first
    const setupWin = createSetupWindow()
    ipcMain.once("setup-complete", async function() {
      setupWin.close()
      await startOllama()
      createWindow()
    })
  } else {
    // Start Ollama and open main app
    await startOllama()
    createWindow()
  }
})

app.on("window-all-closed", function() {
  stopOllama()
  if (process.platform !== "darwin") app.quit()
})

app.on("activate", function() {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

app.on("before-quit", function() {
  stopOllama()
})
