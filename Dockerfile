FROM node:lts-alpine as base

RUN apk add \
    make \
    g++ \
    python3

FROM base as dependencies

RUN mkdir /app && chown -R node:node /app
USER node
WORKDIR /app

COPY --chown=node:node .yarn ./.yarn
COPY --chown=node:node .pnp.cjs .yarnrc.yml package.json yarn.lock .pnp.loader.mjs ./

# Note yarn rebuild - this is to let yarn rebuild binaries
RUN yarn install --inline-builds

FROM dependencies as builder

# RUN mkdir /app && chown -R node:node /app
USER node
WORKDIR /app

ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV

COPY --chown=node:node . .
COPY --chown=node:node --from=dependencies /app/.yarn ./.yarn
RUN echo ls -lah

RUN yarn build

FROM base AS runner

# ARG NODE_ENV=production
# ENV NODE_ENV $NODE_ENV

# RUN mkdir /app && chown -R node:node /app
USER node
WORKDIR /app

COPY --chown=node:node --from=dependencies /app/.yarn ./.yarn
COPY --chown=node:node --from=builder /app/dist ./dist
COPY --chown=node:node . .

# The step below is from the Next.js Dockerfile example, but we don't need it because we use Yarn's Zero-installs.
#COPY --from=builder ./node_modules ./node_modules/

# Note yarn rebuild again - this is to let yarn rebuild binaries in the "runner" stage of the Dockerfile
# We also have to remove unplugged, so that rebuilding happens and replaces the old binaries
#RUN rm -rf /app/.yarn/unplugged && yarn rebuild
#RUN chown -R nestjs:nodejs /app/

EXPOSE 3000

CMD ["yarn", "start:prod"]
