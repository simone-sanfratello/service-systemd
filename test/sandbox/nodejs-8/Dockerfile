FROM debian:jessie

RUN apt-get update 
RUN apt-get install -y locales && rm -rf /var/lib/apt/lists/* \
    && localedef -i en_US -c -f UTF-8 -A /usr/share/locale/locale.alias en_US.UTF-8
ENV LANG en_US.utf8
RUN apt-get install -y build-essential systemd sudo curl

RUN curl -sL https://deb.nodesource.com/setup_8.x | -E bash -
RUN apt-get install -y nodejs

COPY package.json ./
RUN npm install
COPY ../../../ .
