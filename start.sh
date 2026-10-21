#!/bin/bash
# Render 后端启动脚本

cd backend
exec uvicorn main:app --host 0.0.0.0 --port $PORT
