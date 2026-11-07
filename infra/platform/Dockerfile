# syntax=docker/dockerfile:1
# Build on the builder's native platform (no emulation for npm ci / next build), run on the target (e.g. linux/amd64).
FROM --platform=$BUILDPLATFORM node:22-bookworm-slim AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY package*.json ./
RUN npm ci
COPY . .
ARG NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY=
ENV NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY=$NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY
RUN npm run build
# The trace copied the build platform's sharp binaries; fetch the target's lockfile version instead (download only, no emulation).
ARG TARGETARCH
RUN cpu=$([ "$TARGETARCH" = amd64 ] && echo x64 || echo "$TARGETARCH") \
 && v=$(node -p "require('./package-lock.json').packages['node_modules/sharp'].version") \
 && mkdir /sharp && cd /sharp && echo '{}' > package.json \
 && npm install --no-save --no-package-lock --os=linux --cpu="$cpu" --libc=glibc "sharp@$v" \
 && rm -rf /app/.next/standalone/node_modules/sharp /app/.next/standalone/node_modules/@img \
 && cp -a node_modules/sharp node_modules/@img /app/.next/standalone/node_modules/

FROM node:22-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 HOSTNAME=0.0.0.0 PORT=3010
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public
USER node
EXPOSE 3010
CMD ["node", "server.js"]
