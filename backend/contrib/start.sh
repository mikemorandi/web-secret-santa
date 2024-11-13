#!/bin/sh
gunicorn secret_santa:app -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
