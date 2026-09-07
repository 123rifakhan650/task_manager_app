#!/usr/bin/env bash
# Exit immediately if a command exits with a non-zero status
set -o errexit

echo "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo "Building React static frontend..."
if command -v npm &> /dev/null; then
    npm install
    npm run build
fi

echo "Collecting Django static files..."
python manage.py collectstatic --no-input

echo "Applying Django database migrations..."
python manage.py migrate --no-input

echo "TaskFlow Django build completed successfully!"
