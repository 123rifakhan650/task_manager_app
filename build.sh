#!/usr/bin/env bash
# Exit immediately if a command exits with a non-zero status
set -o errexit

echo "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo "Building React static frontend..."
if ! command -v npm &> /dev/null; then
    echo "Node.js not detected in Python container. Downloading portable Node.js..."
    NODE_VERSION="v20.12.2"
    mkdir -p /tmp/node
    curl -fsSL "https://nodejs.org/dist/${NODE_VERSION}/node-${NODE_VERSION}-linux-x64.tar.xz" | tar -xJ -C /tmp/node --strip-components=1
    export PATH="/tmp/node/bin:$PATH"
fi

if command -v npm &> /dev/null; then
    echo "Running npm install and npm run build..."
    npm install
    npm run build
fi

echo "Collecting Django static files..."
python manage.py collectstatic --no-input

echo "Applying Django database migrations..."
python manage.py makemigrations --no-input || true
python manage.py migrate --no-input

echo "TaskFlow Django build completed successfully!"
