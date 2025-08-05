FROM python:3.10-slim

# Set working directory inside container
WORKDIR /app

# Install system packages
RUN apt-get update && apt-get install -y \
    build-essential gcc libffi-dev libpq-dev curl && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Python dependencies first to use Docker layer caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Now copy the full project
COPY . .

# Expose port (optional for clarity)
EXPOSE 8000

# Start FastAPI server
CMD ["uvicorn", "core.main:app", "--host", "0.0.0.0", "--port", "8000"]
