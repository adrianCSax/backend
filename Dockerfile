FROM node:14
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY package.json /usr/src/app/package.json
RUN npm cache clean --force
RUN npm install
RUN npm install bcrypt@latest --save
COPY . /usr/src/app
EXPOSE 3000
CMD ["npm", "start"]