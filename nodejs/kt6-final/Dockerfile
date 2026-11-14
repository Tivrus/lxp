FROM node:20-alpine

RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY prisma ./prisma
RUN npx prisma generate

COPY src ./src

ENV NODE_ENV=production
ENV PRISMA_HIDE_UPDATE_MESSAGE=1
EXPOSE 3000

CMD ["npm", "run", "start:prod"]
