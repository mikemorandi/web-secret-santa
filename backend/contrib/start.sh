#!/bin/sh
source venv/bin/activate
gunicorn secret_santa:app --bind 0.0.0.0:8000