FROM node:22 as builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .

FROM node:22-alpine
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app .
EXPOSE 5001
CMD ["node", "index.js"]