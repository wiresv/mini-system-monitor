const { ipcRenderer } = require('electron');

let lastValues = {};

// Enable dragging with left mouse button only
window.addEventListener('DOMContentLoaded', () => {
  let isDragging = false;
  let startX, startY;

  document.body.addEventListener('mousedown', (e) => {
    if (e.button === 0) {
      isDragging = true;
      startX = e.screenX;
      startY = e.screenY;
    }
  });

  document.body.addEventListener('mousemove', (e) => {
    if (isDragging) {
      ipcRenderer.send('drag-window', e.screenX - startX, e.screenY - startY);
      startX = e.screenX;
      startY = e.screenY;
    }
  });

  document.body.addEventListener('mouseup', () => {
    isDragging = false;
  });

  document.body.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    ipcRenderer.send('show-context-menu');
  });
});

// Listen for stats updates from main process
ipcRenderer.on('stats-update', (event, stats) => {
  // CPU (100°C max optimal) - only update if changed
  const cpuTempPercent = Math.min(100, Math.round((stats.cpu.temp / 100) * 100));
  const cpuText = `${stats.cpu.load}% ${cpuTempPercent}%`;
  if (lastValues.cpu !== cpuText) {
    lastValues.cpu = cpuText;
    document.getElementById('cpu').innerHTML = `${stats.cpu.load}<span class="pct cpu-pct">%</span> ${cpuTempPercent}<span class="pct cpu-pct">%</span>`;
  }

  // GPU (83°C max optimal) - only update if changed
  const gpuTempPercent = Math.round((stats.gpu.temp / 83) * 100);
  const gpuText = `${stats.gpu.load}% ${gpuTempPercent}%`;
  if (lastValues.gpu !== gpuText) {
    lastValues.gpu = gpuText;
    document.getElementById('gpu').innerHTML = `${stats.gpu.load}<span class="pct gpu-pct">%</span> ${gpuTempPercent}<span class="pct gpu-pct">%</span>`;
  }

  // RAM - only update if changed
  const ramText = `${stats.ram.percent}%`;
  if (lastValues.ram !== ramText) {
    lastValues.ram = ramText;
    document.getElementById('ram').innerHTML = `${stats.ram.percent}<span class="pct ram-pct">%</span>`;
  }
});
