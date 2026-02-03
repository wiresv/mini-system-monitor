# Mini System Monitor

A minimal, always-on-top system monitoring widget for Windows.

![screenshot](screenshot.png)

## Stats

| Color | Stats | Description |
|-------|-------|-------------|
| 🟢 Green | **CPU** | Load %, Temp % (of 100°C) |
| 🔵 Blue | **GPU** | Load %, Temp % (of 83°C) |
| 🔴 Red | **RAM** | Memory usage % |

## Requirements

- Windows
- [LibreHardwareMonitor](https://github.com/LibreHardwareMonitor/LibreHardwareMonitor) with web server enabled on port 8085

## Usage

1. Start LibreHardwareMonitor with `Options > Web Server > Run`
2. Run `Mini System Monitor.exe`
3. Drag to reposition, right-click for options
