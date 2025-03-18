FROM node:22-alpine

# Create app directory
WORKDIR /app

#ARG NPM_TOKEN
#COPY .npmrc.temp .npmrc
#RUN echo $NPM_TOKEN

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json package-lock.json ./

RUN npm ci

# Bundle app source
COPY . .

EXPOSE 80
EXPOSE 3000

# RUN nodemon
# RUN npm run build
CMD ["npm", "start" ]