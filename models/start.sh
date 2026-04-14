#!/bin/bash
# Start script for Render deployment

echo "Starting Zarfo AI Engine..."
uvicorn main:app --host 0.0.0.0 --port $PORT
