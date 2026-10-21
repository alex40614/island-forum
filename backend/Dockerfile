FROM python:3.12-slim

WORKDIR /app

# 安裝系統依賴
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# 複製依賴文件
COPY requirements.txt .

# 安裝 Python 依賴
RUN pip install --no-cache-dir -r requirements.txt

# 複製應用代碼
COPY . .

# 創建上傳目錄
RUN mkdir -p uploads

# 暴露端口
EXPOSE 8000

# 啟動命令（由 docker-compose 覆蓋）
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
