FROM node:8
RUN apt-get update -y && \
    apt-get upgrade -y
WORKDIR /app
COPY package*.json /app/
RUN npm install
COPY . /app/

ENTRYPOINT [ "node" ]
CMD ["scheduler"]
