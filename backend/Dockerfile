FROM python:3-alpine

RUN apk add --no-cache tzdata
ENV TZ=Europe/Zurich

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY requirements.txt /usr/src/app/

RUN pip3 install --no-cache-dir -r requirements.txt


COPY secret_santa ./secret_santa
COPY requirements.txt ./
COPY contrib/start.sh ./

EXPOSE 8000

ENTRYPOINT ["/bin/sh", "./start.sh"]