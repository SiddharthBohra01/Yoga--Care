# ---- Backend Dockerfile (Multi-stage) ----
# Builder stage
FROM python:3.12-slim AS builder

# Set work directory
WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends gcc libpq-dev libglib2.0-0 ffmpeg libsm6 libxext6 libxrender1 && rm -rf /var/lib/apt/lists/*

# Copy only requirements first for caching
COPY backend/requirements.txt ./requirements.txt
RUN pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt

# Copy application source
COPY backend/. /app/

# Runtime stage
FROM python:3.12-slim AS runtime

# Create non-root user
RUN useradd -m appuser
WORKDIR /app

# Copy installed packages from builder
COPY --from=builder /usr/local/lib/python3.12 /usr/local/lib/python3.12
COPY --from=builder /usr/local/bin /usr/local/bin

# Copy application code
COPY --from=builder /app /app

# Use non-root user
USER appuser

# Expose port (uvicorn default)
EXPOSE 8000

# Command: use gunicorn with uvicorn workers for production
CMD ["gunicorn", "app.main:app", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8000", "--log-level", "info"]
