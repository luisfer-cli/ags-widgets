#!/bin/bash
# Get current active workspace information
hyprctl activeworkspace -j 2>/dev/null || echo "{}"