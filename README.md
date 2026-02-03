# Mini System Monitor

A minimal, always-on-top system monitoring widget for Windows.

![widget preview](https://img.shields.io/badge/CPU-12%25%2045%25-a5f9a5?style=flat-square) ![gpu](https://img.shields.io/badge/GPU-8%25%2052%25-a5d4f9?style=flat-square) ![ram](https://img.shields.io/badge/RAM-67%25-f9a5a5?style=flat-square)

## Stats

| Stat | Description |
|------|-------------|
| **CPU Load** | Current CPU utilization (0-100%) |
| **CPU Temp** | CPU temperature as % of 100°C max |
| **GPU Load** | Current GPU utilization (0-100%) |
| **GPU Temp** | GPU temperature as % of 83°C max |
| **RAM** | Memory usage (0-100%) |

## Requirements

- Windows
- [LibreHardwareMonitor](https://github.com/LibreHardwareMonitor/LibreHardwareMonitor) with web server enabled on port 8085

## Usage

1. Start LibreHardwareMonitor with `Options > Web Server > Run`
2. Run `Mini System Monitor.exe`
3. Drag to reposition, right-click for options
