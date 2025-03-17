# build environment
FROM node:21-alpine as build

WORKDIR /app

COPY package.json package-lock.json  ./

RUN npm ci

COPY . .

RUN npm run build

# server environment
FROM nginx:alpine

COPY ./deployment/nginx.conf /etc/nginx/conf.d/configfile.template

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

