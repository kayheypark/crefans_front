FROM node:22-bookworm-slim
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY --chown=node:node . .
ARG NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY=
ENV NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY=$NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY
RUN npm run build && chown -R node:node .next
USER node
EXPOSE 3010
CMD ["npm", "run", "start", "--", "--hostname", "0.0.0.0", "--port", "3010"]
