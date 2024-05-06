FROM python:3.11-alpine

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY requirements.txt /usr/src/app/

RUN pip3 install --no-cache-dir -r requirements.txt

COPY . /usr/src/app
COPY contrib/start.sh ./

EXPOSE 8000

ENTRYPOINT ["/bin/sh", "./start.sh"]