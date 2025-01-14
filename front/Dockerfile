FROM node:20.18-alpine AS builder

WORKDIR /app
ENV NODE_ENV=production

COPY package.json yarn.lock ./
COPY . .

RUN yarn install
RUN yarn build

FROM node:20.18-alpine AS runner

WORKDIR /app

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./

RUN yarn install --production

EXPOSE 3000

CMD ["yarn", "start"]
