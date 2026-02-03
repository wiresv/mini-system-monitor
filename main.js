const { app, BrowserWindow, Menu, screen, ipcMain } = require('electron');
const path = require('path');
const http = require('http');

// Disable hardware acceleration to reduce GPU/memory usage
app.disableHardwareAcceleration();

let mainWindow;
let lhmData = { cpuTemp: 0, cpuLoad: 0, gpuTemp: 0, gpuLoad: 0, ramPercent: 0 };
let lastStats = null;

// Fetch all stats from LibreHardwareMonitor web server
function fetchLHMData() {
  const req = http.get('http://localhost:8085/data.json', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const json = JSON.parse(data);

        const cpuTemp = findSensorValue(json, 'Temperatures', ['CPU Package', 'Core (Tctl/Tdie)']);
        const cpuLoad = findSensorValue(json, 'Load', ['CPU Total']);
        const gpuTemp = findSensorValue(json, 'Temperatures', ['GPU Core']);
        const gpuLoad = findSensorValue(json, 'Load', ['GPU Core']);
        const ramPercent = findSensorValue(json, 'Load', ['Memory']);

        if (cpuTemp !== null) lhmData.cpuTemp = cpuTemp;
        if (cpuLoad !== null) lhmData.cpuLoad = cpuLoad;
        if (gpuTemp !== null) lhmData.gpuTemp = gpuTemp;
        if (gpuLoad !== null) lhmData.gpuLoad = gpuLoad;
        if (ramPercent !== null) lhmData.ramPercent = ramPercent;
      } catch (err) {
        // Ignore parse errors
      }
    });
  });
  req.on('error', () => {});
  req.setTimeout(1000, () => req.destroy());
}

// Recursively find a sensor value in LHM JSON
// sectionName: "Temperatures", "Load", etc.
// sensorNames: array of possible sensor names to match (e.g., ["CPU Package", "Core (Tctl/Tdie)"])
function findSensorValue(node, sectionName, sensorNames, inSection = false) {
  const isInSection = inSection || (node.Text && node.Text === sectionName);

  if (isInSection && node.Text && node.Value) {
    for (const name of sensorNames) {
      if (node.Text.includes(name)) {
        const match = node.Value.match(/([\d.]+)/);
        if (match) return parseFloat(match[1]);
      }
    }
  }

  if (node.Children) {
    for (const child of node.Children) {
      const result = findSensorValue(child, sectionName, sensorNames, isInSection);
      if (result !== null) return result;
    }
  }
  return null;
}

function getStats() {
  return {
    cpu: {
      load: Math.round(lhmData.cpuLoad || 0),
      temp: Math.round(lhmData.cpuTemp || 0)
    },
    gpu: {
      load: Math.round(lhmData.gpuLoad || 0),
      temp: Math.round(lhmData.gpuTemp || 0)
    },
    ram: {
      percent: Math.round(lhmData.ramPercent || 0)
    }
  };
}

// Only send update if values changed
function statsChanged(newStats) {
  if (!lastStats) return true;
  return (
    newStats.cpu.load !== lastStats.cpu.load ||
    newStats.cpu.temp !== lastStats.cpu.temp ||
    newStats.gpu.load !== lastStats.gpu.load ||
    newStats.gpu.temp !== lastStats.gpu.temp ||
    newStats.ram.percent !== lastStats.ram.percent
  );
}

function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;

  const windowWidth = 190;
  const windowHeight = 24;
  const rightMargin = 10;
  const bottomMargin = 5;

  mainWindow = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
    x: screenWidth - windowWidth - rightMargin,
    y: screenHeight - windowHeight - bottomMargin,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    transparent: true,
    resizable: false,
    focusable: true,
    hasShadow: false,
    show: false,
    paintWhenInitiallyHidden: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      backgroundThrottling: false
    }
  });

  mainWindow.loadFile('index.html');

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  ipcMain.on('show-context-menu', () => {
    const isOnTop = mainWindow.isAlwaysOnTop();
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Always on Top',
        type: 'checkbox',
        checked: isOnTop,
        click: () => {
          mainWindow.setAlwaysOnTop(!isOnTop);
        }
      },
      { type: 'separator' },
      {
        label: 'Exit',
        click: () => {
          app.quit();
        }
      }
    ]);
    contextMenu.popup();
  });

  ipcMain.on('drag-window', (event, deltaX, deltaY) => {
    const [x, y] = mainWindow.getPosition();
    mainWindow.setPosition(x + deltaX, y + deltaY);
  });

  // Fetch LHM data every 2 seconds (temps don't change rapidly)
  setInterval(fetchLHMData, 2000);
  fetchLHMData();

  mainWindow.webContents.on('did-finish-load', () => {
    setInterval(() => {
      const stats = getStats();
      if (mainWindow && !mainWindow.isDestroyed() && statsChanged(stats)) {
        lastStats = stats;
        mainWindow.webContents.send('stats-update', stats);
      }
    }, 1000);

    const stats = getStats();
    lastStats = stats;
    mainWindow.webContents.send('stats-update', stats);
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  app.quit();
});
