#!/bin/bash
# Get current active window information
hyprctl activewindow -j 2>/dev/null || echo "{}"