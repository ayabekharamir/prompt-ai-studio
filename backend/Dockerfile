FROM python:3.12-slim[cite: 9]

WORKDIR /app[cite: 9]

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential libpq-dev curl \
    && rm -rf /var/lib/apt/lists/*[cite: 9]

COPY requirements.txt .[cite: 9]

RUN pip install --no-cache-dir -r requirements.txt[cite: 9]

COPY . .[cite: 9]

EXPOSE 8000[cite: 9]

# Brand Assets (uploaded files) are written to STORAGE_LOCAL_PATH
# (default /data/brand-assets, see app/core/config.py and .env.example).[cite: 9]
# This directory is NOT declared as a Docker VOLUME here on purpose, to
# avoid surprising anonymous-volume behavior on hosts that don't expect
# it - whichever host runs this image (Railway, Miznbanfa, or a plain VPS)
# should mount a persistent volume/disk at that same path so uploads
# survive restarts and redeploys. Without it, uploaded files are lost on
# every container restart.[cite: 9]

CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"][cite: 9]
