#!/bin/bash
# Get monitors information
hyprctl monitors -j 2>/dev/null || echo "[]"